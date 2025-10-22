<?php

namespace App\Http\Controllers;

use App\Models\Creditor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreditorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $creditors = Creditor::orderBy('created_at', 'desc')->get();
        return response()->json($creditors);
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
            'cpf_cnpj' => 'required|string|max:255|unique:creditors,cpf_cnpj',
            'name' => 'required|string|max:255',
        ]);
        
        $creditors = Creditor::create([
            'cpf_cnpj' => $data['cpf_cnpj'],
            'name' => $data['name'],
            'total_amount_owed' => 0,
        ]);

        return response()->json($creditors, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $creditor = Creditor::findOrFail($id);
            return Inertia::render('DashboardCreditor', [
                'creditor' => $creditor,
            ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Creditor $creditor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Creditor $creditor)
    {
         $request->validate([
            'cpf_cnpj' => 'required|unique:creditors,cpf_cnpj,' . $creditor->id,
            'name' => 'required|string|max:255',
            'total_amount_owed' => 'required|numeric|min:0',
        ]);

        $creditor->cpf_cnpj = $request->input('cpf_cnpj');
        $creditor->name = $request->input('name');
        $creditor->total_amount_owed = $request->input('total_amount_owed');
        $creditor->save();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $creditor = Creditor::findOrFail($id);
        $creditor->delete();

        return response()->json(['message' => 'Credor removido com sucesso.'], 200);
    }
}
