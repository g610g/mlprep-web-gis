<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SpatialData extends Model
{
    protected $table = 'spatial_data';
    
    protected $fillable = [
        'name', 'type', 'properties', 'geom'
    ];

    protected $casts = [
        'properties' => 'array'
    ];

    // Get data as GeoJSON
    public static function getGeoJSON($bounds = null, $tableName = 'spatial_data')
    {
        $query = "
            SELECT jsonb_build_object(
                'type', 'FeatureCollection',
                'features', COALESCE(jsonb_agg(
                    jsonb_build_object(
                        'type', 'Feature',
                        'id', id,
                        'geometry', ST_AsGeoJSON(geom)::jsonb,
                        'properties', jsonb_build_object(
                            'name', name,
                            'type', type,
                            'properties', properties
                        )
                    )
                ), '[]'::jsonb)
            ) as geojson
            FROM {$tableName}
        ";

        if ($bounds) {
            $query .= " WHERE ST_Intersects(geom, ST_MakeEnvelope(?, ?, ?, ?, 4326))";
            $result = DB::select($query, $bounds);
        } else {
            $result = DB::select($query);
        }

        return $result[0]->geojson ?? null;
    }

    // Import shapefile data
    public static function importShapefile($shapefilePath, $tableName = 'spatial_data')
    {
        $command = "shp2pgsql -s 4326 -a -W utf-8 {$shapefilePath} {$tableName} | psql " . 
                   "-h " . env('DB_HOST') . 
                   " -U " . env('DB_USERNAME') . 
                   " -d " . env('DB_DATABASE');
        
        return shell_exec($command);
    }
}