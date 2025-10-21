<?php

namespace App\Http\Controllers;

use App\Models\AccountTransfer;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountTransferController extends Controller
{
    public function __construct()
    {
        $this->middleware('web');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(AccountTransfer::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'from_account_id' => 'required|exists:accounts,id|different:to_account_id',
            'to_account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($data) {
            $from = Account::lockForUpdate()->findOrFail($data['from_account_id']);
            $to = Account::lockForUpdate()->findOrFail($data['to_account_id']);

            $amount = (float) $data['amount'];
            if ($from->current_balance < $amount) {
                return response()->json(['message' => 'Saldo insuficiente na conta de origem.'], 422);
            }

            // cria transferência
            $transfer = AccountTransfer::create([
                'from_account_id' => $from->id,
                'to_account_id' => $to->id,
                'amount' => $amount,
                'description' => $data['description'] ?? null,
            ]);

            // atualiza saldos
            $from->current_balance = $from->current_balance - $amount;
            $to->current_balance = $to->current_balance + $amount;
            $from->save();
            $to->save();

            return response()->json($transfer, 201);
        });
    }

    public function show($id)
    {
        return response()->json(AccountTransfer::findOrFail($id));
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $transfer = AccountTransfer::findOrFail($id);

            $from = Account::lockForUpdate()->findOrFail($transfer->from_account_id);
            $to = Account::lockForUpdate()->findOrFail($transfer->to_account_id);

            // reverter saldos
            $from->current_balance = $from->current_balance + $transfer->amount;
            $to->current_balance = $to->current_balance - $transfer->amount;

            // valida se to tem saldo suficiente para subtrair (opcional)
            if ($to->current_balance < 0) {
                return response()->json(['message' => 'Não é possível reverter: saldo da conta destino ficaria negativo.'], 422);
            }

            $from->save();
            $to->save();

            $transfer->delete();

            return response()->json(null, 204);
        });
    }
}
