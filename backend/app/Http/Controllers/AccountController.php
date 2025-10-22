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
        //
        $request->validate([
            'number' => 'required|unique:accounts,number,' . $account->id,
            'name' => 'required|string|max:255',
            'initial_balance' => 'required|numeric|min:0',
        ]);

        $account->number = $request->input('number');
        $account->name = $request->input('name');
        $account->initial_balance = $request->input('initial_balance');
        $account->current_balance = $request->input('initial_balance');
        $account->save();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Account $account)
    {
        //
        $account->delete();
    }
}
