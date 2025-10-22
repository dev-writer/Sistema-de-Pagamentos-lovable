<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Creditor extends Model
{
    protected $table = 'creditors';
    
    protected $fillable = [
        'name',
        'document',
    ];


}
