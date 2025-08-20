<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UploadShapeFileToGeoserver extends Controller
{
    public function uploadShapeFile(Request $request)
    {
        if (!$request->hasFile('zipfile')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        $file = $request->file('zipfile');
        $fileName = $file->getClientOriginalName();
        $storeName = pathinfo($fileName, PATHINFO_FILENAME);

        $tempPath = $file->getPathname();

        $client = new Client([
            'base_uri' => 'http://localhost:8080/geoserver/rest',
            'auth'     => ['admin', 'geoserver'],
        ]);

        $workspace = 'mlprep';
        $datastore = $storeName;

        try {
            // 1) Create datastore if not exists
            $client->request('POST', "/workspaces/{$workspace}/datastores", [
                'headers' => ['Content-Type' => 'application/json'],
                'json'    => [
                    'dataStore' => [
                        'name' => $datastore,
                        'connectionParameters' => new \stdClass
                    ]
                ]
            ]);

            // 2) Upload the zipped shapefile
            $response = $client->request(
                'PUT',
                "/workspaces/{$workspace}/datastores/{$datastore}/file",
                [
                    'headers' => ['Content-Type' => 'application/zip'],
                    'body' => fopen($tempPath, 'r')
                ]
            );

            return response()->json([
                'status'  => $response->getStatusCode(),
                'message' => 'Uploaded successfully'
            ], 200);

        } catch (\Throwable $e) {
            Log::error("GeoServer upload error: ".$e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
