<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function create(Request $request): Response
    {
        $user = $request->user()->loadMissing('transporterProfile.vehicles');
        $transporter = $user->transporterProfile;

        return Inertia::render('Vehicles/Create', [
            'vehicles' => $transporter
                ? $transporter->vehicles
                    ->sortByDesc('created_at')
                    ->map(fn (Vehicle $vehicle) => [
                        'id' => $vehicle->id,
                        'plate' => $vehicle->plate,
                        'vehicle_type' => $vehicle->vehicle_type,
                        'brand' => $vehicle->brand,
                        'model' => $vehicle->model,
                        'model_year' => $vehicle->model_year,
                        'color' => $vehicle->color,
                        'capacity_kg' => (float) $vehicle->capacity_kg,
                        'insurance_expires_at' => $vehicle->insurance_expires_at?->toDateString(),
                        'technical_review_expires_at' => $vehicle->technical_review_expires_at?->toDateString(),
                        'status' => $vehicle->status,
                        'review_notes' => $vehicle->review_notes,
                    ])
                    ->values()
                : [],
        ]);
    }

    public function store(StoreVehicleRequest $request): RedirectResponse
    {
        $transporter = $request->user()->transporterProfile;

        Vehicle::create([
            'transporter_id' => $transporter->id,
            'plate' => $request->string('plate')->toString(),
            'vehicle_type' => $request->string('vehicle_type')->toString(),
            'brand' => $request->string('brand')->toString(),
            'model' => $request->string('model')->toString(),
            'model_year' => $request->integer('model_year'),
            'color' => $request->filled('color')
                ? $request->string('color')->toString()
                : null,
            'capacity_kg' => $request->input('capacity_kg'),
            'vehicle_photo_path' => $request->file('vehicle_photo')->store('vehicle-documents', 'public'),
            'transit_license_image_path' => $request->file('transit_license_image')->store('vehicle-documents', 'public'),
            'insurance_expires_at' => $request->date('insurance_expires_at'),
            'insurance_image_path' => $request->file('insurance_image')->store('vehicle-documents', 'public'),
            'technical_review_expires_at' => $request->date('technical_review_expires_at'),
            'technical_review_image_path' => $request->file('technical_review_image')->store('vehicle-documents', 'public'),
            'status' => Vehicle::STATUS_PENDING,
        ]);

        return back()->with('success', 'Vehiculo registrado correctamente. Quedo pendiente de revision administrativa.');
    }

    public function approve(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $vehicle->update([
            'status' => Vehicle::STATUS_AVAILABLE,
            'reviewed_by_admin_id' => $request->user()->id,
            'reviewed_at' => now(),
            'review_notes' => null,
        ]);

        return back()->with('success', 'Vehiculo aprobado. El transportista ya puede publicar rutas con este vehiculo.');
    }

    public function reject(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $vehicle->update([
            'status' => Vehicle::STATUS_REJECTED,
            'reviewed_by_admin_id' => $request->user()->id,
            'reviewed_at' => now(),
            'review_notes' => 'Rechazado desde el panel administrativo.',
        ]);

        return back()->with('success', 'Vehiculo rechazado correctamente.');
    }
}
