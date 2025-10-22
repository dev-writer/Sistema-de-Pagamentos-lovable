<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payments = Payment::with(['account', 'creditor'])->orderBy('created_at', 'desc')->get();
        return response()->json($payments);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'creditor_id' => 'required|exists:creditors,id',
            'amount' => 'required|numeric|min:0',
            'gross_amount' => 'sometimes|numeric|min:0',
            'tax_rate' => 'sometimes|numeric|min:0|max:100',
            'tax_amount' => 'sometimes|numeric|min:0',
            'net_amount' => 'sometimes|numeric|min:0',
            'payment_date' => 'required|date',
            'status' => 'sometimes|string|in:pending,completed,failed',
        ]);

        // Use net_amount as the main amount if provided, otherwise use amount
        $data['amount'] = $data['net_amount'] ?? $data['amount'];

        $payment = Payment::create($data);

        // Update account balance
        $account = $payment->account;
        if ($account) {
            $account->current_balance -= $payment->amount;
            $account->save();
        }

        return response()->json($payment->load(['account', 'creditor']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(['message' => 'Pagamento removido com sucesso.'], 200);
    }
}
