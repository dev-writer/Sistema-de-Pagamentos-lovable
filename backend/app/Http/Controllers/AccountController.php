<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $accounts = Account::orderBy('created_at', 'desc')->get();
        return response()->json($accounts);
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
            'number' => 'required|string|max:255|unique:accounts,number',
            'name' => 'required|string|max:255',
            'initial_balance' => 'required|numeric',
        ]);

        $account = Account::create([
            'number' => $data['number'],
            'name' => $data['name'],
            'initial_balance' => $data['initial_balance'],
            'current_balance' => $data['initial_balance'],
        ]);

        return response()->json($account, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $account = Account::findOrFail($id);
            return Inertia::render('DashboardAccount', [
                'account' => $account,
            ]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Account $account)
    {
        //
        // return view('accounts.edit', compact('account'));
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Account $account)
    {
        $request->validate([
            'number' => 'sometimes|required|unique:accounts,number,' . $account->id,
            'name' => 'sometimes|required|string|max:255',
            'initial_balance' => 'sometimes|required|numeric|min:0',
            'current_balance' => 'sometimes|required|numeric',
        ]);

        if ($request->has('number')) {
            $account->number = $request->input('number');
        }
        if ($request->has('name')) {
            $account->name = $request->input('name');
        }
        if ($request->has('initial_balance')) {
            $account->initial_balance = $request->input('initial_balance');
            $account->current_balance = $request->input('initial_balance');
        }
        if ($request->has('current_balance')) {
            $account->current_balance = $request->input('current_balance');
        }
        $account->save();

        return response()->json($account);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account)
    {
        //
        $account->delete();
    }

    public function deposit(Request $request, $id)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:1000',
        ]);

        $account = Account::findOrFail($id);

        $current = $account->current_balance ?? $account->initial_balance ?? 0;
        $account->current_balance = $current + $data['amount'];
        $account->save();
            return response()->json($account);
    }

}
