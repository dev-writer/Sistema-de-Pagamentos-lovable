<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountTransfer extends Model
{
    protected $table = 'accounts_transfer';
    
    protected $fillable = [
        'from_account_id',
        'to_account_id',
        'amount',
        'transferred_at',
    ];

    
}
