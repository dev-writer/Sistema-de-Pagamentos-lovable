<?php

namespace App\Http\Controllers;

use App\Models\AccountTransfer;
use Illuminate\Http\Request;

class AccountTransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transfers = Transfer::with(['fromAccount', 'toAccount'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($transfers);
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
            'from_account_id' => 'required|exists:accounts,id',
            'to_account_id' => 'required|exists:accounts,id|different:from_account_id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $fromAccount = Account::findOrFail($data['from_account_id']);
            $toAccount = Account::findOrFail($data['to_account_id']);

            if ($fromAccount->current_balance < $data['amount']) {
                throw new \Exception('Saldo insuficiente');
            }

            // Atualiza saldos
            $fromAccount->current_balance -= $data['amount'];
            $toAccount->current_balance += $data['amount'];
            
            $fromAccount->save();
            $toAccount->save();

            // Cria transferência
            $transfer = Transfer::create($data);

            DB::commit();

            return response()->json($transfer->load(['fromAccount', 'toAccount']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AccountTransfer $accountTransfer)
    {
        //
        return $accountTransfer;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AccountTransfer $accountTransfer)
    {
        //

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AccountTransfer $accountTransfer)
    {
        //
        $validated = $request->validate([
            'from_account_id' => 'required|integer|exists:accounts,id',
            'to_account_id' => 'required|integer|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'transferred_at' => 'required|date',
        ]);
        $accountTransfer->update($validated);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfer $transfer)
    {
        try {
            DB::beginTransaction();

            // Reverte saldos
            $transfer->fromAccount->current_balance += $transfer->amount;
            $transfer->toAccount->current_balance -= $transfer->amount;
            
            $transfer->fromAccount->save();
            $transfer->toAccount->save();
            
            $transfer->delete();

            DB::commit();
            return response()->json(null, 204);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao reverter transferência'
            ], 422);
        }
    }
}
