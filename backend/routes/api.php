<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CreditorController;
use App\Http\Controllers\PaymentController;


Route::apiResource('accounts', AccountController::class);
Route::apiResource('creditors', CreditorController::class);
Route::apiResource('payments', PaymentController::class);
