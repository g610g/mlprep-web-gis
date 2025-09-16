<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Data extends Model
{
    //
    protected $table = 'data';

    protected $fillable = [
        'name', 'description', 'filename', 'path', 'file_extension', 'size'
    ];


    
}
