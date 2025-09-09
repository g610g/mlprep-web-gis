<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Data;

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


}
