<?php

use App\Http\Controllers\AuthLoadingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleRedirectController;
use App\Http\Controllers\TransporterVerificationController;
use App\Http\Controllers\TransportRequestController;
use App\Http\Controllers\TransportRouteController;
use App\Http\Controllers\VehicleController;
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
    Route::get('/acceso/preparando', [AuthLoadingController::class, 'show'])->name('auth.loading');

    Route::get('/rutas', [RoleRedirectController::class, 'routes'])->name('routes.index');

    Route::get('/transportista/panel', [DashboardController::class, 'transporter'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.dashboard');
    Route::get('/transportista/rutas', [TransportRouteController::class, 'transporterIndex'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.routes.index');
    Route::get('/transportista/vehiculos/registrar', [VehicleController::class, 'create'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.vehicles.create');
    Route::post('/transportista/rutas', [TransportRouteController::class, 'store'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.routes.store');
    Route::post('/transportista/vehiculos', [VehicleController::class, 'store'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.vehicles.store');
    Route::post('/transportista/solicitudes/{transportRequest}/aceptar', [TransportRequestController::class, 'accept'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.transport-requests.accept');
    Route::post('/transportista/solicitudes/{transportRequest}/rechazar', [TransportRequestController::class, 'reject'])
        ->middleware(['verified', 'role:transportista'])
        ->name('transporter.transport-requests.reject');

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
    Route::get('/administrador/transportistas/validar', [TransporterVerificationController::class, 'index'])
        ->middleware(['verified', 'role:administrador'])
        ->name('admin.transporters.index');
    Route::get('/administrador/documentos-transportista/{documentVerification}', [TransporterVerificationController::class, 'showDocument'])
        ->middleware(['verified', 'role:administrador'])
        ->name('admin.transporter-documents.show');
    Route::post('/administrador/transportistas/{transporter}/aprobar', [TransporterVerificationController::class, 'approve'])
        ->middleware(['verified', 'role:administrador'])
        ->name('admin.transporters.approve');
    Route::post('/administrador/transportistas/{transporter}/rechazar', [TransporterVerificationController::class, 'reject'])
        ->middleware(['verified', 'role:administrador'])
        ->name('admin.transporters.reject');
    Route::post('/administrador/vehiculos/{vehicle}/aprobar', [VehicleController::class, 'approve'])
        ->middleware(['verified', 'role:administrador'])
        ->name('admin.vehicles.approve');
    Route::post('/administrador/vehiculos/{vehicle}/rechazar', [VehicleController::class, 'reject'])
        ->middleware(['verified', 'role:administrador'])
        ->name('admin.vehicles.reject');
});

require __DIR__.'/auth.php';
