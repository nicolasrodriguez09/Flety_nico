<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransportRouteRequest;
use App\Http\Requests\UpdateTransportRouteRequest;
use App\Models\Service;
use App\Models\Transporter;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use App\Services\OpenRouteService;
use App\Services\TransportCostEstimator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransportRouteController extends Controller
{
    public function transporterIndex(Request $request): Response
    {
        TransportRoute::cancelExpiredUnstartedRoutes();

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
                ->orderBy('departure_at')
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
                    'min_cargo_weight_kg' => (float) $route->min_cargo_weight_kg,
                    'distance_km' => $route->distance_km !== null ? (float) $route->distance_km : null,
                    'estimated_duration_minutes' => $route->estimated_duration_minutes,
                    'route_geometry' => $route->route_geometry,
                    'permitted_cargo_type' => $route->permitted_cargo_type,
                    'status' => $route->operationalStatus(),
                    'stored_status' => $route->status,
                    'transport_requests_count' => $route->transport_requests_count,
                    'vehicle' => $route->vehicle ? [
                        'id' => $route->vehicle->id,
                        'plate' => $route->vehicle->plate,
                        'vehicle_type' => $route->vehicle->vehicle_type,
                        'capacity_kg' => (float) $route->vehicle->capacity_kg,
                    ] : null,
                ])
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
        ]);
    }

    public function producerIndex(Request $request): Response
    {
        TransportRoute::cancelExpiredUnstartedRoutes();

        $user = $request->user()->loadMissing([
            'role:id,name,slug',
            'producerProfile',
        ]);

        $producer = $user->producerProfile;
        $routeFilters = [
            'origin' => trim($request->string('origin')->toString()),
            'destination' => trim($request->string('destination')->toString()),
            'cargo_weight_kg' => $request->filled('cargo_weight_kg') && (float) $request->input('cargo_weight_kg') > 0
                ? (float) $request->input('cargo_weight_kg')
                : null,
            'product_type' => trim($request->string('product_type')->toString()),
        ];
        $costEstimator = app(TransportCostEstimator::class);
        $routeFilters['product_category'] = $routeFilters['product_type'] !== ''
            ? $costEstimator->categoryForProduct($routeFilters['product_type'])
            : null;

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
            ->when($routeFilters['cargo_weight_kg'], fn (Builder $query) => $query
                ->where('available_capacity_kg', '>=', $routeFilters['cargo_weight_kg'])
                ->where('min_cargo_weight_kg', '<=', $routeFilters['cargo_weight_kg']))
            ->whereColumn('available_capacity_kg', '>=', 'min_cargo_weight_kg')
            ->orderBy('departure_at')
            ->paginate(5)
            ->withQueryString()
            ->through(function (TransportRoute $route) use ($costEstimator, $routeFilters) {
                $distanceKm = $route->distance_km !== null ? (float) $route->distance_km : null;

                return [
                    'id' => $route->id,
                    'origin' => $route->origin,
                    'origin_lat' => $route->origin_lat !== null ? (float) $route->origin_lat : null,
                    'origin_lng' => $route->origin_lng !== null ? (float) $route->origin_lng : null,
                    'destination' => $route->destination,
                    'destination_lat' => $route->destination_lat !== null ? (float) $route->destination_lat : null,
                    'destination_lng' => $route->destination_lng !== null ? (float) $route->destination_lng : null,
                    'departure_at' => $route->departure_at?->toIso8601String(),
                    'available_capacity_kg' => (float) $route->available_capacity_kg,
                    'min_cargo_weight_kg' => (float) $route->min_cargo_weight_kg,
                    'distance_km' => $distanceKm,
                    'estimated_duration_minutes' => $route->estimated_duration_minutes,
                    'estimated_cost' => $costEstimator->estimate($distanceKm, $routeFilters['cargo_weight_kg'], null, $routeFilters['product_category']),
                    'route_geometry' => $route->route_geometry,
                    'permitted_cargo_type' => $route->permitted_cargo_type,
                    'status' => $route->operationalStatus(),
                    'stored_status' => $route->status,
                    'vehicle' => $route->vehicle ? [
                        'plate' => $route->vehicle->plate,
                        'vehicle_type' => $route->vehicle->vehicle_type,
                        'capacity_kg' => (float) $route->vehicle->capacity_kg,
                    ] : null,
                    'transporter' => $route->transporter?->user ? [
                        'id' => $route->transporter->id,
                        'name' => $route->transporter->user->name,
                        'payment_methods' => $route->transporter->payment_methods ?? [],
                    ] : null,
                ];
            });

        $myRequests = $producer
            ? $producer->transportRequests()
                ->with(['route.vehicle:id,plate,vehicle_type', 'route.transporter.user:id,name'])
                ->latest('requested_at')
                ->get()
                ->map(fn ($transportRequest) => [
                    'id' => $transportRequest->id,
                    'cargo_weight_kg' => (float) $transportRequest->cargo_weight_kg,
                    'product_type' => $transportRequest->product_type,
                    'product_category' => $transportRequest->product_category,
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

    public function producerShow(Request $request, TransportRoute $transportRoute): Response
    {
        TransportRoute::cancelExpiredUnstartedRoutes();
        $transportRoute->refresh();

        $transportRoute->load([
            'vehicle:id,plate,vehicle_type,capacity_kg',
            'transporter.user:id,name',
        ]);

        abort_if(
            $transportRoute->status !== TransportRoute::STATUS_PUBLISHED ||
            $transportRoute->departure_at <= now() ||
            (float) $transportRoute->available_capacity_kg < (float) $transportRoute->min_cargo_weight_kg ||
            ! $transportRoute->transporter?->isValidated(),
            404
        );

        $cargoWeightKg = $request->filled('cargo_weight_kg') && (float) $request->input('cargo_weight_kg') > 0
            ? min((float) $request->input('cargo_weight_kg'), (float) $transportRoute->available_capacity_kg)
            : null;
        $productType = trim($request->string('product_type')->toString());
        $productCategory = $productType !== ''
            ? app(TransportCostEstimator::class)->categoryForProduct($productType)
            : null;
        $estimatedCost = app(TransportCostEstimator::class)->estimate(
            $transportRoute->distance_km,
            $cargoWeightKg,
            $productType,
            $productCategory,
        );

        return Inertia::render('Routes/Show', [
            'transportRoute' => [
                'id' => $transportRoute->id,
                'origin' => $transportRoute->origin,
                'origin_lat' => $transportRoute->origin_lat !== null ? (float) $transportRoute->origin_lat : null,
                'origin_lng' => $transportRoute->origin_lng !== null ? (float) $transportRoute->origin_lng : null,
                'destination' => $transportRoute->destination,
                'destination_lat' => $transportRoute->destination_lat !== null ? (float) $transportRoute->destination_lat : null,
                'destination_lng' => $transportRoute->destination_lng !== null ? (float) $transportRoute->destination_lng : null,
                'departure_at' => $transportRoute->departure_at?->toIso8601String(),
                'available_capacity_kg' => (float) $transportRoute->available_capacity_kg,
                'min_cargo_weight_kg' => (float) $transportRoute->min_cargo_weight_kg,
                'distance_km' => $transportRoute->distance_km !== null ? (float) $transportRoute->distance_km : null,
                'estimated_duration_minutes' => $transportRoute->estimated_duration_minutes,
                'estimated_cost' => $estimatedCost,
                'cost_estimate_weight_kg' => $cargoWeightKg,
                'cost_estimate_product_type' => $productType,
                'cost_estimate_product_category' => $productCategory,
                'route_geometry' => $transportRoute->route_geometry,
                'permitted_cargo_type' => $transportRoute->permitted_cargo_type,
                'status' => $transportRoute->operationalStatus(),
                'stored_status' => $transportRoute->status,
                'vehicle' => $transportRoute->vehicle ? [
                    'plate' => $transportRoute->vehicle->plate,
                    'vehicle_type' => $transportRoute->vehicle->vehicle_type,
                    'capacity_kg' => (float) $transportRoute->vehicle->capacity_kg,
                ] : null,
                'transporter' => $transportRoute->transporter?->user ? [
                    'id' => $transportRoute->transporter->id,
                    'name' => $transportRoute->transporter->user->name,
                    'payment_methods' => $transportRoute->transporter->payment_methods ?? [],
                ] : null,
            ],
            'already_requested' => $request->user()
                ?->producer
                ?->transportRequests()
                ->where('transport_route_id', $transportRoute->id)
                ->exists() ?? false,
        ]);
    }

    public function producerTransporterShow(Request $request, Transporter $transporter): Response
    {
        $transporter->loadMissing([
            'user:id,name,phone',
            'vehicles' => fn ($query) => $query
                ->select('id', 'transporter_id', 'plate', 'vehicle_type', 'capacity_kg', 'status')
                ->orderBy('vehicle_type')
                ->orderBy('plate'),
        ]);

        abort_if(! $transporter->isValidated(), 404);

        $activeRoutes = TransportRoute::query()
            ->with('vehicle:id,plate,vehicle_type,capacity_kg')
            ->where('transporter_id', $transporter->id)
            ->where('status', TransportRoute::STATUS_PUBLISHED)
            ->where('departure_at', '>', now())
            ->orderBy('departure_at')
            ->take(6)
            ->get();

        return Inertia::render('Producer/TransporterProfile', [
            'transporter' => [
                'id' => $transporter->id,
                'name' => $transporter->user?->name,
                'validation_status' => $transporter->validation_status,
                'rating_average' => (float) $transporter->rating_average,
                'active_routes_count' => $activeRoutes->count(),
                'vehicles_count' => $transporter->vehicles->count(),
                'vehicles' => $transporter->vehicles->map(fn ($vehicle) => [
                    'id' => $vehicle->id,
                    'plate' => $vehicle->plate,
                    'vehicle_type' => $vehicle->vehicle_type,
                    'capacity_kg' => (float) $vehicle->capacity_kg,
                    'status' => $vehicle->status,
                ])->values(),
                'active_routes' => $activeRoutes->map(fn (TransportRoute $route) => [
                    'id' => $route->id,
                    'origin' => $route->origin,
                    'destination' => $route->destination,
                    'departure_at' => $route->departure_at?->toIso8601String(),
                    'available_capacity_kg' => (float) $route->available_capacity_kg,
                    'min_cargo_weight_kg' => (float) $route->min_cargo_weight_kg,
                    'permitted_cargo_type' => $route->permitted_cargo_type,
                    'vehicle' => $route->vehicle ? [
                        'plate' => $route->vehicle->plate,
                        'vehicle_type' => $route->vehicle->vehicle_type,
                    ] : null,
                ])->values(),
            ],
        ]);
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'origin_lat' => ['required', 'numeric', 'between:-4.5,13.8'],
            'origin_lng' => ['required', 'numeric', 'between:-82.2,-66.7'],
            'destination_lat' => ['required', 'numeric', 'between:-4.5,13.8'],
            'destination_lng' => ['required', 'numeric', 'between:-82.2,-66.7'],
        ]);

        $routeMapData = $this->routeMapData(
            $validated['origin_lat'],
            $validated['origin_lng'],
            $validated['destination_lat'],
            $validated['destination_lng'],
        );

        // Eliminado la restricción estricta de geometría para permitir fallbacks del mapa

        return response()->json($routeMapData);
    }

    public function store(StoreTransportRouteRequest $request): RedirectResponse
    {
        $transporter = $request->user()->transporterProfile;

        $originLat = $request->input('origin_lat');
        $originLng = $request->input('origin_lng');
        $destinationLat = $request->input('destination_lat');
        $destinationLng = $request->input('destination_lng');

        $routeMapData = $this->routeMapData($originLat, $originLng, $destinationLat, $destinationLng);

        // Eliminado la restricción estricta de geometría para permitir fallbacks del mapa

        $departureAt = $this->parseColombiaDateTime($request->input('departure_at'));

        if ($conflictingRoute = $this->vehicleScheduleConflict(
            $request->integer('vehicle_id'),
            $departureAt,
            $routeMapData['estimated_duration_minutes'],
        )) {
            return back()
                ->withErrors([
                    'vehicle_id' => $this->vehicleConflictMessage($conflictingRoute),
                ])
                ->with('route_conflict', $this->vehicleConflictData($conflictingRoute))
                ->withInput();
        }

        TransportRoute::create([
            'transporter_id' => $transporter->id,
            'vehicle_id' => $request->integer('vehicle_id'),
            'origin' => $request->string('origin')->toString(),
            'origin_lat' => $originLat,
            'origin_lng' => $originLng,
            'destination' => $request->string('destination')->toString(),
            'destination_lat' => $destinationLat,
            'destination_lng' => $destinationLng,
            'departure_at' => $departureAt,
            'available_capacity_kg' => $request->input('available_capacity_kg'),
            'min_cargo_weight_kg' => $request->input('min_cargo_weight_kg'),
            'distance_km' => $routeMapData['distance_km'],
            'estimated_duration_minutes' => $routeMapData['estimated_duration_minutes'],
            'route_geometry' => $routeMapData['route_geometry'],
            'permitted_cargo_type' => 'Carga definida por el productor',
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

        // Eliminado la restricción estricta de geometría para permitir fallbacks del mapa

        $departureAt = $this->parseColombiaDateTime($request->input('departure_at'));

        if ($conflictingRoute = $this->vehicleScheduleConflict(
            $request->integer('vehicle_id'),
            $departureAt,
            $routeMapData['estimated_duration_minutes'],
            $transportRoute->id,
        )) {
            return back()
                ->withErrors([
                    'vehicle_id' => $this->vehicleConflictMessage($conflictingRoute),
                ])
                ->with('route_conflict', $this->vehicleConflictData($conflictingRoute))
                ->withInput();
        }

        $transportRoute->update([
            'vehicle_id' => $request->integer('vehicle_id'),
            'origin' => $request->string('origin')->toString(),
            'origin_lat' => $originLat,
            'origin_lng' => $originLng,
            'destination' => $request->string('destination')->toString(),
            'destination_lat' => $destinationLat,
            'destination_lng' => $destinationLng,
            'departure_at' => $departureAt,
            'available_capacity_kg' => $request->input('available_capacity_kg'),
            'min_cargo_weight_kg' => $request->input('min_cargo_weight_kg'),
            'distance_km' => $routeMapData['distance_km'],
            'estimated_duration_minutes' => $routeMapData['estimated_duration_minutes'],
            'route_geometry' => $routeMapData['route_geometry'],
            'permitted_cargo_type' => 'Carga definida por el productor',
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

    public function start(Request $request, TransportRoute $transportRoute): RedirectResponse
    {
        $transporter = $request->user()->transporterProfile;

        abort_if(
            ! $transporter || (int) $transportRoute->transporter_id !== (int) $transporter->id,
            403
        );

        if ($transportRoute->status === TransportRoute::STATUS_IN_PROGRESS) {
            return back()->with('success', 'La ruta ya se encuentra en camino.');
        }

        if (! in_array($transportRoute->status, [TransportRoute::STATUS_PUBLISHED, TransportRoute::STATUS_CLOSED], true)) {
            return back()->with('error', 'Esta ruta no se puede iniciar en su estado actual.');
        }

        if ($transportRoute->departure_at?->isFuture()) {
            return back()->with('error', 'Aun no es la hora de salida de esta ruta.');
        }

        $transportRoute->update([
            'status' => TransportRoute::STATUS_IN_PROGRESS,
        ]);

        return back()->with('success', 'Ruta iniciada correctamente. Buen viaje.');
    }

    public function cancel(Request $request, TransportRoute $transportRoute): RedirectResponse
    {
        $transporter = $request->user()->transporterProfile;

        abort_if(
            ! $transporter || (int) $transportRoute->transporter_id !== (int) $transporter->id,
            403
        );

        if (in_array($transportRoute->status, [TransportRoute::STATUS_COMPLETED, TransportRoute::STATUS_IN_PROGRESS], true)) {
            return back()->with('error', 'Esta ruta ya no se puede cancelar desde este modulo.');
        }

        $transportRoute->update([
            'status' => TransportRoute::STATUS_CANCELLED,
        ]);

        return back()->with('success', 'Ruta cancelada correctamente.');
    }

    public function complete(Request $request, TransportRoute $transportRoute): RedirectResponse
    {
        $transporter = $request->user()->transporterProfile;

        abort_if(
            ! $transporter || (int) $transportRoute->transporter_id !== (int) $transporter->id,
            403
        );

        if ($transportRoute->status === TransportRoute::STATUS_CANCELLED) {
            return back()->with('error', 'Una ruta cancelada no se puede marcar como completa.');
        }

        if (! in_array($transportRoute->status, [TransportRoute::STATUS_IN_PROGRESS, TransportRoute::STATUS_COMPLETED], true)) {
            return back()->with('error', 'Primero debes iniciar la ruta para poder marcarla como completa.');
        }

        if ($transportRoute->status !== TransportRoute::STATUS_COMPLETED) {
            $transportRoute->update([
                'status' => TransportRoute::STATUS_COMPLETED,
            ]);
        }

        return back()->with('success', 'Ruta marcada como completa.');
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
                'product_category' => $service->transportRequest->product_category,
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
                'product_category' => $service->transportRequest->product_category,
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

    private function parseColombiaDateTime(mixed $value): Carbon
    {
        return Carbon::parse((string) $value, config('app.timezone'));
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

    private function vehicleScheduleConflict(
        int $vehicleId,
        Carbon $departureAt,
        ?int $estimatedDurationMinutes,
        ?int $ignoreRouteId = null,
    ): ?TransportRoute {
        $durationMinutes = max(1, $estimatedDurationMinutes ?? 300);
        $requestedStart = $departureAt->copy();
        $requestedEnd = $departureAt->copy()->addMinutes($durationMinutes);

        return TransportRoute::query()
            ->where('vehicle_id', $vehicleId)
            ->whereIn('status', [
                TransportRoute::STATUS_PUBLISHED,
                TransportRoute::STATUS_CLOSED,
                TransportRoute::STATUS_IN_PROGRESS,
            ])
            ->when($ignoreRouteId, fn (Builder $query) => $query->whereKeyNot($ignoreRouteId))
            ->get()
            ->first(function (TransportRoute $route) use ($requestedStart, $requestedEnd) {
                if (! $route->departure_at) {
                    return false;
                }

                $existingDurationMinutes = max(1, $route->estimated_duration_minutes ?? 300);
                $existingStart = $route->departure_at->copy();
                $existingEnd = $route->departure_at->copy()->addMinutes($existingDurationMinutes);

                return $requestedStart->lessThan($existingEnd)
                    && $requestedEnd->greaterThan($existingStart);
            });
    }

    private function vehicleConflictMessage(TransportRoute $route): string
    {
        $vehicleLabel = trim(implode(' ', array_filter([
            $route->vehicle?->vehicle_type,
            $route->vehicle?->plate,
        ]))) ?: 'seleccionado';

        return "Ya tienes una ruta pendiente en otro lugar en este intervalo de tiempo con el vehiculo {$vehicleLabel}. Cancela la ruta anterior o selecciona otro vehiculo para publicarla.";
    }

    /**
     * @return array<string, mixed>
     */
    private function vehicleConflictData(TransportRoute $route): array
    {
        $route->loadMissing('vehicle:id,plate,vehicle_type,capacity_kg');

        return [
            'id' => $route->id,
            'origin' => $route->origin,
            'destination' => $route->destination,
            'departure_at' => $route->departure_at?->toIso8601String(),
            'estimated_duration_minutes' => $route->estimated_duration_minutes,
            'status' => $route->operationalStatus(),
            'vehicle' => $route->vehicle ? [
                'id' => $route->vehicle->id,
                'plate' => $route->vehicle->plate,
                'vehicle_type' => $route->vehicle->vehicle_type,
                'capacity_kg' => (float) $route->vehicle->capacity_kg,
            ] : null,
        ];
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