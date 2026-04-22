<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleRedirectController;
use App\Http\Controllers\TransportRequestController;
use App\Http\Controllers\TransportRouteController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [RoleRedirectController::class, 'dashboard'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/rutas', [RoleRedirectController::class, 'routes'])->name('routes.index');

    Route::get('/transportista/panel', [DashboardController::class, 'transporter'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.dashboard');
    Route::get('/transportista/rutas', [TransportRouteController::class, 'transporterIndex'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.routes.index');
    Route::post('/transportista/rutas', [TransportRouteController::class, 'store'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.routes.store');
    Route::post('/transportista/vehiculos', [VehicleController::class, 'store'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.vehicles.store');

    Route::get('/productor/panel', [DashboardController::class, 'producer'])
        ->middleware(['verified', 'role:productor'])
        ->name('producer.dashboard');
    Route::get('/productor/rutas', [TransportRouteController::class, 'producerIndex'])
        ->middleware(['verified', 'role:productor'])
        ->name('producer.routes.index');
    Route::post('/productor/solicitudes', [TransportRequestController::class, 'store'])
        ->middleware(['verified', 'role:productor'])
        ->name('producer.transport-requests.store');

    Route::get('/administrador/panel', [DashboardController::class, 'admin'])
        ->middleware(['verified', 'role:administrador'])
        ->name('admin.dashboard');
});

require __DIR__.'/auth.php';
