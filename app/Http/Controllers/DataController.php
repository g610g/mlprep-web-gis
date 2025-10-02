<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Data;
use Illuminate\Support\Facades\Storage;


class DataController extends Controller
{
    //

    public function store(Request $request)
    {
        $request->validate([
            // 'file' => 'required|file|max:2048',
            'name' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $file = $request->file('file');

        $path = $file->store('uploads/data', 'public');
        
        $data = Data::create([
            'name'          => $request->name,
            'description'   => $request->description,
            'filename'      => $file->getClientOriginalName(),
            'path'          => $path,
            'file_extension'=> $file->getClientOriginalExtension(),
            'size'          => $file->getSize(),
        ]);

        return response()->json($data, 201);
    }


    public function fetch() {
    return response()->json(Data::orderByDesc('created_at')->get(), 200);
}


    public function download(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:data,id',
        ]);

        $data = Data::findOrFail($request->id);

        if (!Storage::disk('public')->exists($data->path)) {
            return response()->json(['error' => 'File not found.'], 404);
        }

        // This automatically sets Content-Disposition with filename
        return Storage::disk('public')->download($data->path, $data->filename);
    }


}
