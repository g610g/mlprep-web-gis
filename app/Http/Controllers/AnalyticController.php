<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class AnalyticController extends Controller
{
    //
    public function upload(Request $request)
    {
    $request->validate([
        'gpkg' => 'required|file',
    ]);

    // Store .gpkg file in the same way as DataController
    $path = $request->file('gpkg')->store('uploads/data', 'public');

    // Correct full system path (public disk)
    $gpkgPath = Storage::disk('public')->path($path);

    if (!file_exists($gpkgPath)) {
        return response()->json(['error' => "File not found at $gpkgPath"], 500);
    }

    // Open GeoPackage using SQLite
    $pdo = new \PDO("sqlite:" . $gpkgPath);

    $tables = $pdo->query("SELECT table_name FROM gpkg_contents")
                  ->fetchAll(\PDO::FETCH_COLUMN);

    if (empty($tables)) {
        return response()->json(['error' => 'No tables found in gpkg'], 400);
    }

    $result = [];
    foreach ($tables as $table) {
        $columns = $pdo->query("PRAGMA table_info($table)")
                       ->fetchAll(\PDO::FETCH_ASSOC);

        $colNames = array_map(fn($col) => $col['name'], $columns);

        $result[] = [
            'table' => $table,
            'columns' => $colNames
        ];
    }

    return response()->json([
        'tables' => $result
    ]);
}

}
