<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UploadShapeFileToGeoserver extends Controller
{
    public function uploadShapeFile(Request $request)
    {
        // Validate file upload
        if (!$request->hasFile('zipfile')) {
            return back()->withErrors(['zipfile' => 'No file found']);
        }

        $file = $request->file('zipfile');
        $fileName = $file->getClientOriginalName();
        $storeName = pathinfo($fileName, PATHINFO_FILENAME);
        
        // Log the file details
        Log::info("Attempting to upload file: {$fileName}");
        Log::info("Store name: {$storeName}");
        
        // GeoServer configuration
        $workspace = 'mlprep';
        $datastore = $storeName;

        try {
            // Test GeoServer connection first
            $client = new Client([
                'timeout' => 60,
                'verify' => false, // Disable SSL verification for local testing
            ]);

            // Test if GeoServer is accessible
            $testResponse = $client->request('GET', 'http://localhost:8080/geoserver/rest/workspaces', [
                'auth' => ['admin', 'geoserver']
            ]);
            
            Log::info("GeoServer connection test successful");

            // Now try to upload the shapefile
            $response = $client->request('PUT', "http://localhost:8080/geoserver/rest/workspaces/{$workspace}/datastores/{$datastore}/file.shp", [
                'headers' => [
                    'Content-Type' => 'application/zip'
                ],
                'auth' => ['admin', 'geoserver'],
                'body' => fopen($file->getPathname(), 'r')
            ]);

            Log::info("Upload successful with status: " . $response->getStatusCode());

            // Return Inertia response instead of JSON
            return back()->with([
                'success' => 'Shapefile uploaded successfully',
                'datastore' => $datastore,
                'upload_status' => $response->getStatusCode()
            ]);

        } catch (RequestException $e) {
            $statusCode = $e->getResponse() ? $e->getResponse()->getStatusCode() : 500;
            $responseBody = $e->getResponse() ? $e->getResponse()->getBody()->getContents() : 'No response';
            
            Log::error("GeoServer upload error: " . $e->getMessage());
            Log::error("Status Code: " . $statusCode);
            Log::error("Response: " . $responseBody);
            
            return back()->withErrors([
                'upload' => "GeoServer error ({$statusCode}): " . $e->getMessage()
            ])->with([
                'error_details' => $responseBody
            ]);
            
        } catch (\Exception $e) {
            Log::error("General upload error: " . $e->getMessage());
            
            return back()->withErrors([
                'upload' => 'Upload failed: ' . $e->getMessage()
            ]);
        }
    }
}