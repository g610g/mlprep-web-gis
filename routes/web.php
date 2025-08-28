<?php

use App\Http\Controllers\GeoServer;
use App\Http\Controllers\UploadShapeFileToGeoserver;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('landing');
})->name('landing');

Route::get('/login', function () {
    return Inertia::render('login');
})->name('login');

Route::get('/map', function () {
    return Inertia::render('map');
})->name('map');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::prefix('geoserver')->group(function () {
    
    // Get all layers
    Route::get('/layers', function () {
        $geoServer = new GeoServer();
        $layers = $geoServer->getLayer(null, 'array');
        return response()->json($layers);
    });
    
    // Get specific layer
    Route::get('/layers/{layer}', function ($layer) {
        $geoServer = new GeoServer();
        $layerInfo = $geoServer->getLayer($layer, 'array');
        return response()->json($layerInfo);
    });
    
    // Delete specific layer
    Route::delete('/layers/{layer}', function ($layer) {
        $geoServer = new GeoServer();
        $result = $geoServer->deleteLayer($layer);
        
        return response()->json($result, $result['http_code']);
    });
    
    // Delete multiple layers
    Route::delete('/layers', function () {
        $layers = request()->input('layers', []);
        
        if (empty($layers)) {
            return response()->json([
                'success' => false,
                'message' => 'No layers specified for deletion'
            ], 400);
        }
        
        $geoServer = new GeoServer();
        $results = $geoServer->deleteLayers($layers);
        
        return response()->json([
            'success' => true,
            'results' => $results
        ]);
    });
    
    // Get all workspaces
    Route::get('/workspaces', function () {
        $geoServer = new GeoServer();
        $workspaces = $geoServer->getWorkspace(null, 'array');
        return response()->json($workspaces);
    });
    
    // Get specific workspace
    Route::get('/workspaces/{workspace}', function ($workspace) {
        $geoServer = new GeoServer();
        $workspaceInfo = $geoServer->getWorkspace($workspace, 'array');
        return response()->json($workspaceInfo);
    });
    
    // Delete specific workspace
    Route::delete('/workspaces/{workspace}', function ($workspace) {
        $recurse = request()->input('recurse', true);
        $geoServer = new GeoServer();
        $result = $geoServer->deleteWorkspace($workspace, $recurse);
        
        return response()->json($result, $result['http_code']);
    });
    
    // Get WFS capabilities
    Route::get('/features/capabilities', function () {
        $geoServer = new GeoServer();
        $capabilities = $geoServer->getFeatureInfo('GetCapabilities');
        return response($capabilities, 200, ['Content-Type' => 'application/json']);
    });
    
    // Get feature info for specific layer
    Route::get('/features/{layerName}', function ($layerName) {
        $geoServer = new GeoServer();
        $features = $geoServer->getFeatureInfo('GetFeature', $layerName);
        return response($features, 200, ['Content-Type' => 'application/json']);
    });
    
    // Get styles for workspace
    Route::get('/workspaces/{workspace}/styles', function ($workspace) {
        $geoServer = new GeoServer();
        $styles = $geoServer->getStyle($workspace, null, 'array');
        return response()->json($styles);
    });
    
    // Get specific style SLD
    Route::get('/workspaces/{workspace}/styles/{style}', function ($workspace, $style) {
        $geoServer = new GeoServer();
        $sld = $geoServer->getStyle($workspace, $style);
        return response($sld, 200, ['Content-Type' => 'application/xml']);
    });
    
    // Post uploaded shape file
    Route::post('/upload', [UploadShapeFileToGeoserver::class, 'uploadShapeFile']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';