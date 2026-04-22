<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransportRequestRequest;
use App\Models\Service;
use App\Models\ServiceContact;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransportRequestController extends Controller
{
    public function store(StoreTransportRequestRequest $request): RedirectResponse
    {
        $producer = $request->user()->producerProfile;

        TransportRequest::create([
            'transport_route_id' => $request->integer('transport_route_id'),
            'producer_id' => $producer->id,
            'cargo_weight_kg' => $request->input('cargo_weight_kg'),
            'product_type' => $request->string('product_type')->toString(),
            'delivery_destination' => $request->string('delivery_destination')->toString(),
            'estimated_cost' => $request->input('estimated_cost'),
            'status' => TransportRequest::STATUS_PENDING,
            'requested_at' => now(),
        ]);

        return back()->with('success', 'Solicitud registrada correctamente.');
    }

    public function accept(Request $request, TransportRequest $transportRequest): RedirectResponse
    {
        $transportRequest->loadMissing([
            'route.transporter.user:id,phone',
            'producer.user:id,phone',
            'service.contact',
        ]);

        $transporter = $request->user()?->transporterProfile;

        if (! $transporter || $transportRequest->route?->transporter_id !== $transporter->id) {
            abort(403);
        }

        if ($transportRequest->status !== TransportRequest::STATUS_PENDING) {
            return back()->with('error', 'Solo puedes aceptar solicitudes pendientes.');
        }

        if ($transportRequest->route?->status !== TransportRoute::STATUS_PUBLISHED) {
            return back()->with('error', 'La ruta ya no se encuentra disponible para confirmar este servicio.');
        }

        if ((float) $transportRequest->cargo_weight_kg > (float) $transportRequest->route->available_capacity_kg) {
            return back()->with('error', 'La solicitud supera la capacidad restante de la ruta.');
        }

        $transporterPhone = $transportRequest->route?->transporter?->user?->phone;
        $producerPhone = $transportRequest->producer?->user?->phone;

        if (! $transporterPhone || ! $producerPhone) {
            return back()->with('error', 'Ambas partes deben tener telefono registrado para habilitar el contacto.');
        }

        DB::transaction(function () use ($transportRequest, $transporterPhone) {
            $route = $transportRequest->route;
            $remainingCapacity = max(
                0,
                round((float) $route->available_capacity_kg - (float) $transportRequest->cargo_weight_kg, 2),
            );

            $transportRequest->update([
                'status' => TransportRequest::STATUS_ACCEPTED,
            ]);

            $route->update([
                'available_capacity_kg' => $remainingCapacity,
                'status' => $remainingCapacity > 0
                    ? TransportRoute::STATUS_PUBLISHED
                    : TransportRoute::STATUS_CLOSED,
            ]);

            $service = Service::query()->updateOrCreate(
                ['transport_request_id' => $transportRequest->id],
                [
                    'transport_route_id' => $route->id,
                    'confirmed_at' => now(),
                    'status' => Service::STATUS_CONFIRMED,
                ],
            );

            ServiceContact::query()->updateOrCreate(
                ['service_id' => $service->id],
                [
                    'shared_phone' => $transporterPhone,
                    'shared_whatsapp' => $this->normalizeWhatsappNumber($transporterPhone),
                    'enabled_at' => now(),
                ],
            );
        });

        return back()->with('success', 'Solicitud aceptada. El contacto entre productor y transportista ya esta habilitado.');
    }

    public function reject(Request $request, TransportRequest $transportRequest): RedirectResponse
    {
        $transportRequest->loadMissing('route');

        $transporter = $request->user()?->transporterProfile;

        if (! $transporter || $transportRequest->route?->transporter_id !== $transporter->id) {
            abort(403);
        }

        if ($transportRequest->status !== TransportRequest::STATUS_PENDING) {
            return back()->with('error', 'Solo puedes rechazar solicitudes pendientes.');
        }

        $transportRequest->update([
            'status' => TransportRequest::STATUS_REJECTED,
        ]);

        return back()->with('success', 'Solicitud rechazada correctamente.');
    }

    private function normalizeWhatsappNumber(?string $phone): ?string
    {
        if (! $phone) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone);

        if (! $digits) {
            return null;
        }

        if (strlen($digits) === 10) {
            return '57'.$digits;
        }

        return ltrim($digits, '0');
    }
}
