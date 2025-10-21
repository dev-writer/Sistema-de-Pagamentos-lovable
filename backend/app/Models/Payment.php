<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';
    
    protected $fillable = [
        'account_id',
        'creditor_id',
        'amount',
        'payment_date',
        'status',
    ];

    
}
