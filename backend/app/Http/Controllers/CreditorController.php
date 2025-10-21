<?php

namespace App\Http\Controllers;

use App\Models\Creditor;
use Illuminate\Http\Request;


    /**
     * Display a listing of the resource.
     */
    class CreditorController extends Controller
{
    public function index()
    {
        return response()->json(Creditor::orderBy('created_at','desc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'nullable|string|max:255',
        ]);

        $creditor = Creditor::create($data);

        return response()->json($creditor, 201);
    }

    public function update(Request $request, $id)
    {
        $creditor = Creditor::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'nullable|string|max:255',
        ]);

        $creditor->update($data);

        return response()->json($creditor);
    }

    public function show($id)
    {
        return response()->json(Creditor::findOrFail($id));
    }

    public function destroy($id)
    {
        $c = Creditor::findOrFail($id);
        $c->delete();
        return response()->json(null, 204);
    }
}