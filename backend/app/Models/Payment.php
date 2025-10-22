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
        'gross_amount',
        'tax_rate',
        'tax_amount',
        'net_amount',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function creditor()
    {
        return $this->belongsTo(Creditor::class);
    }

    
}
