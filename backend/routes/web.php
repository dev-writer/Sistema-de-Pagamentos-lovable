<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CreditorController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AccountTransferController;


Route::resource('accounts', AccountController::class);
Route::resource('creditors', CreditorController::class);
Route::resource('payments', PaymentController::class);
Route::resource('transfers', AccountTransferController::class);


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
route::get('/transferencias', function () {
    return Inertia::render('AccountTransfers');
});
route::get('/contas', function () {
    return Inertia::render('Accounts');
});
route::get('/dashboardcredor', function () {
    return Inertia::render('CreditorDashboard');
});
route::get('/credores', function () {
    return Inertia::render('Creditors');
});

route::get('/dashboardcontas', function () {
    return Inertia::render('Dashboard copy');
});
route::get('/pagamentos', function () {
    return Inertia::render('Payments');
});
route::get('/pagamentos/relatorio', function () {
    return Inertia::render('PaymentsReports');
});
route::get('/notfound', function () {
    return Inertia::render('NotFound');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
