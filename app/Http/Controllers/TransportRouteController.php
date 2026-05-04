<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransportRouteRequest;
use App\Http\Requests\UpdateTransportRouteRequest;
use App\Models\Service;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use App\Services\OpenRouteService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransportRouteController extends Controller
{
    public function transporterIndex(Request $request): Response
    {
        $user = $request->user()->loadMissing([
            'role:id,name,slug',
            'transporterProfile.vehicles',
            'transporterProfile.routes.vehicle',
        ]);

        $transporter = $user->transporterProfile;

        $myRoutes = $transporter
            ? $transporter->routes()
                ->with('vehicle:id,plate,vehicle_type,capacity_kg')
                ->withCount('transportRequests')
                ->orderByDesc('departure_at')
                ->get()
                ->map(fn (TransportRoute $route) => [
                    'id' => $route->id,
                    'origin' => $route->origin,
                    'origin_lat' => $route->origin_lat !== null ? (float) $route->origin_lat : null,
                    'origin_lng' => $route->origin_lng !== null ? (float) $route->origin_lng : null,
                    'destination' => $route->destination,
                    'destination_lat' => $route->destination_lat !== null ? (float) $route->destination_lat : null,
                    'destination_lng' => $route->destination_lng !== null ? (float) $route->destination_lng : null,
                    'departure_at' => $route->departure_at?->toIso8601String(),
                    'available_capacity_kg' => (float) $route->available_capacity_kg,
                    'distance_km' => $route->distance_km !== null ? (float) $route->distance_km : null,
                    'estimated_duration_minutes' => $route->estimated_duration_minutes,
                    'route_geometry' => $route->route_geometry,
                    'permitted_cargo_type' => $route->permitted_cargo_type,
                    'status' => $route->status,
                    'transport_requests_count' => $route->transport_requests_count,
                    'vehicle' => $route->vehicle ? [
                        'id' => $route->vehicle->id,
                        'plate' => $route->vehicle->plate,
                        'vehicle_type' => $route->vehicle->vehicle_type,
                        'capacity_kg' => (float) $route->vehicle->capacity_kg,
                    ] : null,
                ])
            : [];

        $incomingRequests = $transporter
            ? TransportRequest::query()
                ->with([
                    'route:id,origin,destination,departure_at,transporter_id',
                    'producer.user:id,name',
                ])
                ->whereHas('route', fn (Builder $query) => $query->where('transporter_id', $transporter->id))
                ->latest('requested_at')
                ->get()
                ->map(fn (TransportRequest $transportRequest) => [
                    'id' => $transportRequest->id,
                    'cargo_weight_kg' => (float) $transportRequest->cargo_weight_kg,
                    'product_type' => $transportRequest->product_type,
                    'delivery_destination' => $transportRequest->delivery_destination,
                    'estimated_cost' => $transportRequest->estimated_cost !== null ? (float) $transportRequest->estimated_cost : null,
                    'status' => $transportRequest->status,
                    'requested_at' => $transportRequest->requested_at?->toIso8601String(),
                    'route' => $transportRequest->route ? [
                        'origin' => $transportRequest->route->origin,
                        'destination' => $transportRequest->route->destination,
                        'departure_at' => $transportRequest->route->departure_at?->toIso8601String(),
                    ] : null,
                    'producer' => $transportRequest->producer?->user ? [
                        'name' => $transportRequest->producer->user->name,
                    ] : null,
                ])
            : [];

        $confirmedServices = $transporter
            ? Service::query()
                ->with([
                    'contact',
                    'route.vehicle:id,plate,vehicle_type',
                    'transportRequest.producer.user:id,name,phone',
                ])
                ->where('status', Service::STATUS_CONFIRMED)
                ->whereHas('route', fn (Builder $query) => $query->where('transporter_id', $transporter->id))
                ->latest('confirmed_at')
                ->get()
                ->map(fn (Service $service) => $this->mapServiceForTransporter($service))
                ->filter()
                ->values()
            : [];

        return Inertia::render('Routes/Index', [
            'role' => 'transportista',
            'transporterProfile' => $transporter ? [
                'id' => $transporter->id,
                'validation_status' => $transporter->validation_status,
            ] : null,
            'vehicles' => $transporter
                ? $transporter->vehicles->map(fn ($vehicle) => [
                    'id' => $vehicle->id,
                    'plate' => $vehicle->plate,
                    'vehicle_type' => $vehicle->vehicle_type,
                    'brand' => $vehicle->brand,
                    'model' => $vehicle->model,
                    'model_year' => $vehicle->model_year,
                    'capacity_kg' => (float) $vehicle->capacity_kg,
                    'status' => $vehicle->status,
                ])->values()
                : [],
            'myRoutes' => $myRoutes,
            'availableRoutes' => [],
            'myRequests' => [],
            'incomingRequests' => $incomingRequests,
            'confirmedServices' => $confirmedServices,
        ]);
    }

    public function producerIndex(Request $request): Response
    {
        $user = $request->user()->loadMissing([
            'role:id,name,slug',
            'producerProfile',
        ]);

        $producer = $user->producerProfile;
        $routeFilters = [
            'origin' => trim($request->string('origin')->toString()),
            'destination' => trim($request->string('destination')->toString()),
        ];

        $availableRoutes = TransportRoute::query()
            ->with([
                'vehicle:id,plate,vehicle_type,capacity_kg',
                'transporter.user:id,name',
            ])
            ->where('status', TransportRoute::STATUS_PUBLISHED)
            ->where('departure_at', '>', now())
            ->whereHas('transporter', fn ($query) => $query->where('validation_status', 'approved'))
            ->when($routeFilters['origin'] !== '', fn (Builder $query) => $query
                ->where('origin', 'like', '%'.$routeFilters['origin'].'%'))
            ->when($routeFilters['destination'] !== '', fn (Builder $query) => $query
                ->where('destination', 'like', '%'.$routeFilters['destination'].'%'))
            ->orderBy('departure_at')
            ->limit(50)
            ->get()
            ->map(fn (TransportRoute $route) => [
                'id' => $route->id,
                'origin' => $route->origin,
                'origin_lat' => $route->origin_lat !== null ? (float) $route->origin_lat : null,
                'origin_lng' => $route->origin_lng !== null ? (float) $route->origin_lng : null,
                'destination' => $route->destination,
                'destination_lat' => $route->destination_lat !== null ? (float) $route->destination_lat : null,
                'destination_lng' => $route->destination_lng !== null ? (float) $route->destination_lng : null,
                'departure_at' => $route->departure_at?->toIso8601String(),
                'available_capacity_kg' => (float) $route->available_capacity_kg,
                'distance_km' => $route->distance_km !== null ? (float) $route->distance_km : null,
                'estimated_duration_minutes' => $route->estimated_duration_minutes,
                'route_geometry' => $route->route_geometry,
                'permitted_cargo_type' => $route->permitted_cargo_type,
                'status' => $route->status,
                'vehicle' => $route->vehicle ? [
                    'plate' => $route->vehicle->plate,
                    'vehicle_type' => $route->vehicle->vehicle_type,
                    'capacity_kg' => (float) $route->vehicle->capacity_kg,
                ] : null,
                'transporter' => $route->transporter?->user ? [
                    'name' => $route->transporter->user->name,
                ] : null,
            ]);

        $myRequests = $producer
            ? $producer->transportRequests()
                ->with(['route.vehicle:id,plate,vehicle_type', 'route.transporter.user:id,name'])
                ->latest('requested_at')
                ->get()
                ->map(fn ($transportRequest) => [
                    'id' => $transportRequest->id,
                    'cargo_weight_kg' => (float) $transportRequest->cargo_weight_kg,
                    'product_type' => $transportRequest->product_type,
                    'delivery_destination' => $transportRequest->delivery_destination,
                    'estimated_cost' => $transportRequest->estimated_cost !== null ? (float) $transportRequest->estimated_cost : null,
                    'status' => $transportRequest->status,
                    'requested_at' => $transportRequest->requested_at?->toIso8601String(),
                    'route' => $transportRequest->route ? [
                        'origin' => $transportRequest->route->origin,
                        'destination' => $transportRequest->route->destination,
                        'departure_at' => $transportRequest->route->departure_at?->toIso8601String(),
                        'vehicle' => $transportRequest->route->vehicle ? [
                            'plate' => $transportRequest->route->vehicle->plate,
                            'vehicle_type' => $transportRequest->route->vehicle->vehicle_type,
                        ] : null,
                        'transporter' => $transportRequest->route->transporter?->user ? [
                            'name' => $transportRequest->route->transporter->user->name,
                        ] : null,
                    ] : null,
                ])
            : [];

        $confirmedServices = $producer
            ? Service::query()
                ->with([
                    'contact',
                    'route.vehicle:id,plate,vehicle_type',
                    'route.transporter.user:id,name,phone',
                    'transportRequest.producer:id,user_id',
                ])
                ->where('status', Service::STATUS_CONFIRMED)
                ->whereHas('transportRequest', fn (Builder $query) => $query->where('producer_id', $producer->id))
                ->latest('confirmed_at')
                ->get()
                ->map(fn (Service $service) => $this->mapServiceForProducer($service))
                ->filter()
                ->values()
            : [];

        return Inertia::render('Routes/Index', [
            'role' => 'productor',
            'transporterProfile' => null,
            'vehicles' => [],
            'myRoutes' => [],
            'availableRoutes' => $availableRoutes,
            'routeFilters' => $routeFilters,
            'myRequests' => $myRequests,
            'incomingRequests' => [],
            'confirmedServices' => $confirmedServices,
        ]);
    }

    public function store(StoreTransportRouteRequest $request): RedirectResponse
    {
        $transporter = $request->user()->transporterProfile;

        $originLat = $request->input('origin_lat');
        $originLng = $request->input('origin_lng');
        $destinationLat = $request->input('destination_lat');
        $destinationLng = $request->input('destination_lng');

        $routeMapData = $this->routeMapData($originLat, $originLng, $destinationLat, $destinationLng);

        TransportRoute::create([
            'transporter_id' => $transporter->id,
            'vehicle_id' => $request->integer('vehicle_id'),
            'origin' => $request->string('origin')->toString(),
            'origin_lat' => $originLat,
            'origin_lng' => $originLng,
            'destination' => $request->string('destination')->toString(),
            'destination_lat' => $destinationLat,
            'destination_lng' => $destinationLng,
            'departure_at' => $request->date('departure_at'),
            'available_capacity_kg' => $request->input('available_capacity_kg'),
            'distance_km' => $routeMapData['distance_km'],
            'estimated_duration_minutes' => $routeMapData['estimated_duration_minutes'],
            'route_geometry' => $routeMapData['route_geometry'],
            'permitted_cargo_type' => $request->string('permitted_cargo_type')->toString(),
            'status' => TransportRoute::STATUS_PUBLISHED,
        ]);

        return back()->with('success', 'Ruta publicada correctamente.');
    }

    public function update(UpdateTransportRouteRequest $request, TransportRoute $transportRoute): RedirectResponse
    {
        $originLat = $request->input('origin_lat');
        $originLng = $request->input('origin_lng');
        $destinationLat = $request->input('destination_lat');
        $destinationLng = $request->input('destination_lng');
        $routeMapData = $this->routeMapData($originLat, $originLng, $destinationLat, $destinationLng);

        $transportRoute->update([
            'vehicle_id' => $request->integer('vehicle_id'),
            'origin' => $request->string('origin')->toString(),
            'origin_lat' => $originLat,
            'origin_lng' => $originLng,
            'destination' => $request->string('destination')->toString(),
            'destination_lat' => $destinationLat,
            'destination_lng' => $destinationLng,
            'departure_at' => $request->date('departure_at'),
            'available_capacity_kg' => $request->input('available_capacity_kg'),
            'distance_km' => $routeMapData['distance_km'],
            'estimated_duration_minutes' => $routeMapData['estimated_duration_minutes'],
            'route_geometry' => $routeMapData['route_geometry'],
            'permitted_cargo_type' => $request->string('permitted_cargo_type')->toString(),
        ]);

        return back()->with('success', 'Ruta actualizada correctamente.');
    }

    public function destroy(Request $request, TransportRoute $transportRoute): RedirectResponse
    {
        $transporter = $request->user()->transporterProfile;

        abort_if(
            ! $transporter || (int) $transportRoute->transporter_id !== (int) $transporter->id,
            403
        );

        $transportRoute->delete();

        return back()->with('success', 'Ruta eliminada correctamente.');
    }

    private function mapServiceForTransporter(Service $service): ?array
    {
        if (! $service->contact?->enabled_at) {
            return null;
        }

        $producer = $service->transportRequest?->producer?->user;

        if (! $producer?->phone) {
            return null;
        }

        return [
            'id' => $service->id,
            'status' => $service->status,
            'confirmed_at' => $service->confirmed_at?->toIso8601String(),
            'route' => $service->route ? [
                'origin' => $service->route->origin,
                'destination' => $service->route->destination,
                'departure_at' => $service->route->departure_at?->toIso8601String(),
                'vehicle' => $service->route->vehicle ? [
                    'plate' => $service->route->vehicle->plate,
                    'vehicle_type' => $service->route->vehicle->vehicle_type,
                ] : null,
            ] : null,
            'request' => $service->transportRequest ? [
                'product_type' => $service->transportRequest->product_type,
                'cargo_weight_kg' => (float) $service->transportRequest->cargo_weight_kg,
                'delivery_destination' => $service->transportRequest->delivery_destination,
                'estimated_cost' => $service->transportRequest->estimated_cost !== null ? (float) $service->transportRequest->estimated_cost : null,
            ] : null,
            'counterpart' => [
                'role' => 'productor',
                'name' => $producer->name,
                'phone' => $producer->phone,
                'phone_url' => $this->telLink($producer->phone),
                'whatsapp_url' => $this->whatsappLink($producer->phone),
            ],
        ];
    }

    private function mapServiceForProducer(Service $service): ?array
    {
        if (! $service->contact?->enabled_at) {
            return null;
        }

        $transporter = $service->route?->transporter?->user;

        if (! $transporter?->phone) {
            return null;
        }

        return [
            'id' => $service->id,
            'status' => $service->status,
            'confirmed_at' => $service->confirmed_at?->toIso8601String(),
            'route' => $service->route ? [
                'origin' => $service->route->origin,
                'destination' => $service->route->destination,
                'departure_at' => $service->route->departure_at?->toIso8601String(),
                'vehicle' => $service->route->vehicle ? [
                    'plate' => $service->route->vehicle->plate,
                    'vehicle_type' => $service->route->vehicle->vehicle_type,
                ] : null,
            ] : null,
            'request' => $service->transportRequest ? [
                'product_type' => $service->transportRequest->product_type,
                'cargo_weight_kg' => (float) $service->transportRequest->cargo_weight_kg,
                'delivery_destination' => $service->transportRequest->delivery_destination,
                'estimated_cost' => $service->transportRequest->estimated_cost !== null ? (float) $service->transportRequest->estimated_cost : null,
            ] : null,
            'counterpart' => [
                'role' => 'transportista',
                'name' => $transporter->name,
                'phone' => $transporter->phone,
                'phone_url' => $this->telLink($transporter->phone),
                'whatsapp_url' => $this->whatsappLink($transporter->phone),
            ],
        ];
    }

    private function telLink(?string $phone): ?string
    {
        $digits = $this->digitsOnly($phone);

        return $digits ? 'tel:'.$digits : null;
    }

    private function whatsappLink(?string $phone): ?string
    {
        $digits = $this->digitsOnly($phone);

        if (! $digits) {
            return null;
        }

        if (strlen($digits) === 10) {
            $digits = '57'.$digits;
        }

        return 'https://wa.me/'.$digits;
    }

    private function digitsOnly(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        return $digits ?: null;
    }

    /**
     * @return array{distance_km: ?float, estimated_duration_minutes: ?int, route_geometry: ?array}
     */
    private function routeMapData(
        mixed $originLat,
        mixed $originLng,
        mixed $destinationLat,
        mixed $destinationLng,
    ): array {
        if (
            $originLat === null || $originLat === '' ||
            $originLng === null || $originLng === '' ||
            $destinationLat === null || $destinationLat === '' ||
            $destinationLng === null || $destinationLng === ''
        ) {
            return [
                'distance_km' => null,
                'estimated_duration_minutes' => null,
                'route_geometry' => null,
            ];
        }

        $routeData = app(OpenRouteService::class)->getDrivingRoute(
            (float) $originLat,
            (float) $originLng,
            (float) $destinationLat,
            (float) $destinationLng,
        );

        if ($routeData) {
            return [
                'distance_km' => $routeData['distance_km'],
                'estimated_duration_minutes' => $routeData['duration_minutes'],
                'route_geometry' => $routeData['geometry'],
            ];
        }

        $distanceKm = $this->calculateDistanceKm(
            (float) $originLat,
            (float) $originLng,
            (float) $destinationLat,
            (float) $destinationLng,
        );

        return [
            'distance_km' => $distanceKm,
            'estimated_duration_minutes' => (int) ceil(($distanceKm / 45) * 60),
            'route_geometry' => null,
        ];
    }

    private function calculateDistanceKm(
        float $originLat,
        float $originLng,
        float $destinationLat,
        float $destinationLng
    ): float {
        $earthRadiusKm = 6371;

        $latFrom = deg2rad($originLat);
        $lngFrom = deg2rad($originLng);
        $latTo = deg2rad($destinationLat);
        $lngTo = deg2rad($destinationLng);

        $latDelta = $latTo - $latFrom;
        $lngDelta = $lngTo - $lngFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lngDelta / 2), 2)
        ));

        return round($earthRadiusKm * $angle, 2);
    }
}
