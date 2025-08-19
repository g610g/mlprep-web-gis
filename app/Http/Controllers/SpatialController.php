<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class SpatialController extends Controller
{
    public function uploadShapefile(Request $request)
    {
        $request->validate([
            'shapefile' => 'required|file|mimes:zip,shp',
            'layer_name' => 'required|string|regex:/^[a-zA-Z][a-zA-Z0-9_]*$/',
        ]);

        try {
            $file = $request->file('shapefile');
            $layerName = $request->layer_name;
            
            // Create temporary directory
            $tempDir = storage_path('app/temp/shapefile_' . uniqid());
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $extractedFiles = [];
            
            if ($file->getClientOriginalExtension() === 'zip') {
                // Handle ZIP file
                $zipPath = $tempDir . '/shapefile.zip';
                $file->move($tempDir, 'shapefile.zip');
                
                $zip = new ZipArchive();
                if ($zip->open($zipPath) === TRUE) {
                    $zip->extractTo($tempDir);
                    $zip->close();
                    
                    // Find the .shp file
                    $files = glob($tempDir . '/*.shp');
                    if (empty($files)) {
                        throw new \Exception('No .shp file found in ZIP archive');
                    }
                    $shpFile = $files[0];
                } else {
                    throw new \Exception('Could not extract ZIP file');
                }
            } else {
                // Handle individual .shp file (user needs to upload associated files separately)
                $shpFile = $tempDir . '/' . $file->getClientOriginalName();
                $file->move($tempDir, $file->getClientOriginalName());
            }

            // Import shapefile to PostGIS using shp2pgsql
            $dbConfig = config('database.connections.pgsql');
            $command = sprintf(
                'shp2pgsql -s 4326 -I -W "utf-8" "%s" %s | PGPASSWORD=%s psql -h %s -p %s -U %s -d %s',
                $shpFile,
                $layerName,
                $dbConfig['password'],
                $dbConfig['host'],
                $dbConfig['port'],
                $dbConfig['username'],
                $dbConfig['database']
            );

            $output = shell_exec($command . ' 2>&1');
            
            if (strpos($output, 'ERROR') !== false) {
                throw new \Exception('Failed to import shapefile: ' . $output);
            }

            // Store layer metadata
            DB::table('spatial_layers')->insertOrIgnore([
                'name' => $layerName,
                'original_filename' => $file->getClientOriginalName(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Clean up temporary files
            $this->removeDirectory($tempDir);

            return response()->json([
                'message' => 'Shapefile uploaded and imported successfully',
                'layer_name' => $layerName
            ]);

        } catch (\Exception $e) {
            // Clean up on error
            if (isset($tempDir) && file_exists($tempDir)) {
                $this->removeDirectory($tempDir);
            }
            
            Log::error('Shapefile upload error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to upload shapefile: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getLayers()
    {
        try {
            // Get all spatial tables (excluding PostGIS system tables)
            $layers = DB::select("
                SELECT 
                    schemaname,
                    tablename as name,
                    attname as geometry_column,
                    type as geometry_type
                FROM geometry_columns 
                WHERE schemaname = 'public'
                ORDER BY tablename
            ");

            return response()->json($layers);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getGeoJSON($layerName, Request $request)
    {
        try {
            // Validate layer exists
            $tableExists = DB::select("
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = ?
                )
            ", [$layerName])[0]->exists;

            if (!$tableExists) {
                return response()->json(['error' => 'Layer not found'], 404);
            }

            // Get geometry column name
            $geomColumn = DB::select("
                SELECT f_geometry_column 
                FROM geometry_columns 
                WHERE f_table_name = ? 
                AND f_table_schema = 'public'
            ", [$layerName]);

            $geomColumnName = !empty($geomColumn) ? $geomColumn[0]->f_geometry_column : 'geom';

            // Build query with optional bounding box filter
            $bbox = $request->get('bbox');
            $whereClause = '';
            $params = [$layerName];

            if ($bbox) {
                $bounds = explode(',', $bbox);
                if (count($bounds) === 4) {
                    $whereClause = "WHERE ST_Intersects({$geomColumnName}, ST_MakeEnvelope(?, ?, ?, ?, 4326))";
                    $params = array_merge($params, array_map('floatval', $bounds));
                }
            }

            $sql = "
                SELECT jsonb_build_object(
                    'type', 'FeatureCollection',
                    'features', COALESCE(jsonb_agg(
                        jsonb_build_object(
                            'type', 'Feature',
                            'id', COALESCE(gid, id, ctid::text),
                            'geometry', ST_AsGeoJSON({$geomColumnName})::jsonb,
                            'properties', to_jsonb(t.*) - '{$geomColumnName}'
                        )
                    ), '[]'::jsonb)
                ) as geojson
                FROM {$layerName} t
                {$whereClause}
            ";

            $result = DB::select($sql, $params);
            
            return response()->json($result[0]->geojson ?? []);

        } catch (\Exception $e) {
            Log::error('GeoJSON fetch error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteLayer($layerName)
    {
        try {
            // Drop the table
            DB::statement("DROP TABLE IF EXISTS {$layerName}");
            
            // Remove from metadata table if exists
            DB::table('spatial_layers')->where('name', $layerName)->delete();

            return response()->json(['message' => 'Layer deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function removeDirectory($dir)
    {
        if (!is_dir($dir)) return;
        
        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }
}