<?php

namespace App\Http\Controllers;

use App\Models\Producer;
use App\Models\Role;
use App\Models\Service;
use App\Models\Transporter;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function transporter(Request $request): Response
    {
        $user = $request->user()->loadMissing('transporterProfile');
        $transporter = $user->transporterProfile;

        $routes = $transporter
            ? TransportRoute::query()
                ->where('transporter_id', $transporter->id)
                ->orderByDesc('departure_at')
                ->get()
            : collect();

        $nextRoute = $transporter
            ? TransportRoute::query()
                ->where('transporter_id', $transporter->id)
                ->where('departure_at', '>', now())
                ->orderBy('departure_at')
                ->first()
            : null;

        $incomingRequests = $transporter
            ? TransportRequest::query()
                ->with('route:id,origin,destination,transporter_id')
                ->whereHas('route', fn (Builder $query) => $query->where('transporter_id', $transporter->id))
                ->latest('requested_at')
                ->take(4)
                ->get()
            : collect();

        $pendingRequestsCount = $transporter
            ? TransportRequest::query()
                ->where('status', TransportRequest::STATUS_PENDING)
                ->whereHas('route', fn (Builder $query) => $query->where('transporter_id', $transporter->id))
                ->count()
            : 0;

        $confirmedServicesCount = $transporter
            ? Service::query()
                ->where('status', Service::STATUS_CONFIRMED)
                ->whereHas('route', fn (Builder $query) => $query->where('transporter_id', $transporter->id))
                ->count()
            : 0;

        return Inertia::render('Dashboard', [
            'dashboardRole' => Role::TRANSPORTER,
            'entryRoute' => route('transporter.routes.index'),
            'dashboardData' => [
                'hero' => [
                    'badge' => 'Panel transportista',
                    'title' => 'Tu operacion ya se mueve con datos reales',
                    'subtitle' => 'Desde aqui puedes ver cuantas rutas tienes activas, solicitudes por atender y servicios ya confirmados.',
                ],
                'pills' => [
                    ['label' => 'Rol', 'value' => $user->role?->name ?? 'Transportista'],
                    ['label' => 'Estado', 'value' => $this->humanizeStatus($transporter?->validation_status, 'Sin perfil')],
                    ['label' => 'Contacto', 'value' => $user->phone],
                ],
                'spotlight' => $nextRoute
                    ? [
                        'title' => 'Proxima salida programada',
                        'route' => $nextRoute->origin,
                        'routeTo' => $nextRoute->destination,
                        'dateLabel' => $this->formatDateTime($nextRoute->departure_at),
                        'infoLabel' => 'Capacidad disponible',
                        'infoValue' => $this->formatKilograms($nextRoute->available_capacity_kg),
                        'statusLabel' => $this->humanizeStatus($nextRoute->status),
                    ]
                    : [
                        'title' => 'Proxima salida programada',
                        'route' => 'Sin rutas',
                        'routeTo' => 'publicadas',
                        'dateLabel' => 'Publica tu primera ruta para activar la operacion',
                        'infoLabel' => 'Capacidad disponible',
                        'infoValue' => 'Pendiente',
                        'statusLabel' => 'Sin actividad',
                    ],
                'metrics' => [
                    [
                        'eyebrow' => 'Flota',
                        'title' => 'Vehiculos registrados',
                        'value' => (string) ($transporter?->vehicles()->count() ?? 0),
                        'body' => 'Vehiculos disponibles para publicar rutas.',
                    ],
                    [
                        'eyebrow' => 'Rutas',
                        'title' => 'Rutas activas',
                        'value' => (string) $routes->where('status', TransportRoute::STATUS_PUBLISHED)->count(),
                        'body' => 'Rutas publicadas y visibles para productores.',
                    ],
                    [
                        'eyebrow' => 'Solicitudes',
                        'title' => 'Pendientes por responder',
                        'value' => (string) $pendingRequestsCount,
                        'body' => 'Solicitudes que aun requieren aceptacion o rechazo.',
                    ],
                    [
                        'eyebrow' => 'Servicios',
                        'title' => 'Confirmados',
                        'value' => (string) $confirmedServicesCount,
                        'body' => 'Servicios con contacto ya habilitado.',
                    ],
                ],
                'lists' => [
                    [
                        'title' => 'Ultimas rutas registradas',
                        'emptyMessage' => 'Aun no has publicado rutas.',
                        'items' => $routes
                            ->take(4)
                            ->map(fn (TransportRoute $route) => [
                                'title' => $route->origin.' -> '.$route->destination,
                                'meta' => $this->formatDateTime($route->departure_at).' · '.$this->humanizeStatus($route->status),
                            ])
                            ->values(),
                    ],
                    [
                        'title' => 'Solicitudes recientes',
                        'emptyMessage' => 'Todavia no has recibido solicitudes.',
                        'items' => $incomingRequests
                            ->map(fn (TransportRequest $transportRequest) => [
                                'title' => $transportRequest->product_type.' · '.$this->formatKilograms($transportRequest->cargo_weight_kg),
                                'meta' => ($transportRequest->route?->origin ?? 'Ruta').' -> '.($transportRequest->route?->destination ?? 'Sin destino').' · '.$this->humanizeStatus($transportRequest->status),
                            ])
                            ->values(),
                    ],
                ],
            ],
        ]);
    }

    public function producer(Request $request): Response
    {
        $user = $request->user()->loadMissing('producerProfile');
        $producer = $user->producerProfile;

        $availableRoutes = TransportRoute::query()
            ->where('status', TransportRoute::STATUS_PUBLISHED)
            ->where('departure_at', '>', now())
            ->whereHas('transporter', fn (Builder $query) => $query->where('validation_status', Transporter::STATUS_APPROVED))
            ->orderBy('departure_at')
            ->take(4)
            ->get();

        $allProducerRequests = $producer
            ? TransportRequest::query()
                ->with('route:id,origin,destination')
                ->where('producer_id', $producer->id)
                ->latest('requested_at')
                ->get()
            : collect();

        $availableRoutesCount = TransportRoute::query()
            ->where('status', TransportRoute::STATUS_PUBLISHED)
            ->where('departure_at', '>', now())
            ->whereHas('transporter', fn (Builder $query) => $query->where('validation_status', Transporter::STATUS_APPROVED))
            ->count();

        $confirmedServicesCount = $producer
            ? Service::query()
                ->where('status', Service::STATUS_CONFIRMED)
                ->whereHas('transportRequest', fn (Builder $query) => $query->where('producer_id', $producer->id))
                ->count()
            : 0;

        $spotlightRoute = $availableRoutes->first();

        return Inertia::render('Dashboard', [
            'dashboardRole' => Role::PRODUCER,
            'entryRoute' => route('producer.routes.index'),
            'dashboardData' => [
                'hero' => [
                    'badge' => 'Panel productor',
                    'title' => 'Tu operacion rural ya muestra rutas y solicitudes reales',
                    'subtitle' => 'Aqui ves tu finca, las rutas disponibles para tu carga y el seguimiento de las solicitudes que ya has enviado.',
                ],
                'pills' => [
                    ['label' => 'Finca', 'value' => $producer?->farm_name ?: 'Sin nombre registrado'],
                    ['label' => 'Ubicacion', 'value' => $producer?->farm_location ?: 'Sin ubicacion registrada'],
                    ['label' => 'Contacto', 'value' => $user->phone],
                ],
                'spotlight' => $spotlightRoute
                    ? [
                        'title' => 'Ruta disponible mas cercana',
                        'route' => $spotlightRoute->origin,
                        'routeTo' => $spotlightRoute->destination,
                        'dateLabel' => $this->formatDateTime($spotlightRoute->departure_at),
                        'infoLabel' => 'Capacidad disponible',
                        'infoValue' => $this->formatKilograms($spotlightRoute->available_capacity_kg),
                        'statusLabel' => $this->humanizeStatus($spotlightRoute->status),
                        'mapRoute' => [
                            'id' => $spotlightRoute->id,
                            'origin' => $spotlightRoute->origin,
                            'origin_lat' => $spotlightRoute->origin_lat !== null ? (float) $spotlightRoute->origin_lat : null,
                            'origin_lng' => $spotlightRoute->origin_lng !== null ? (float) $spotlightRoute->origin_lng : null,
                            'destination' => $spotlightRoute->destination,
                            'destination_lat' => $spotlightRoute->destination_lat !== null ? (float) $spotlightRoute->destination_lat : null,
                            'destination_lng' => $spotlightRoute->destination_lng !== null ? (float) $spotlightRoute->destination_lng : null,
                            'available_capacity_kg' => (float) $spotlightRoute->available_capacity_kg,
                            'route_geometry' => $spotlightRoute->route_geometry,
                        ],
                    ]
                    : [
                        'title' => 'Ruta disponible mas cercana',
                        'route' => 'Sin rutas',
                        'routeTo' => 'publicadas',
                        'dateLabel' => 'Aun no hay rutas futuras disponibles',
                        'infoLabel' => 'Capacidad disponible',
                        'infoValue' => 'Pendiente',
                        'statusLabel' => 'Sin actividad',
                        'mapRoute' => null,
                    ],
                'metrics' => [
                    [
                        'eyebrow' => 'Mercado',
                        'title' => 'Rutas disponibles',
                        'value' => (string) $availableRoutesCount,
                        'body' => 'Opciones activas que puedes solicitar ahora mismo.',
                    ],
                    [
                        'eyebrow' => 'Solicitudes',
                        'title' => 'Activas',
                        'value' => (string) $allProducerRequests
                            ->whereIn('status', [TransportRequest::STATUS_PENDING, TransportRequest::STATUS_ACCEPTED])
                            ->count(),
                        'body' => 'Solicitudes que siguen en curso.',
                    ],
                    [
                        'eyebrow' => 'Servicios',
                        'title' => 'Confirmados',
                        'value' => (string) $confirmedServicesCount,
                        'body' => 'Servicios con contacto ya habilitado.',
                    ],
                    [
                        'eyebrow' => 'Produccion',
                        'title' => 'Tipo registrado',
                        'value' => $producer?->production_type ?: 'Sin dato',
                        'body' => 'Perfil productivo cargado en tu cuenta.',
                    ],
                ],
                'lists' => [
                    [
                        'title' => 'Mis solicitudes recientes',
                        'emptyMessage' => 'Todavia no has registrado solicitudes.',
                        'items' => $allProducerRequests
                            ->take(4)
                            ->map(fn (TransportRequest $transportRequest) => [
                                'title' => $transportRequest->product_type.' · '.$this->formatKilograms($transportRequest->cargo_weight_kg),
                                'meta' => ($transportRequest->route?->origin ?? 'Ruta').' -> '.($transportRequest->route?->destination ?? 'Sin destino').' · '.$this->humanizeStatus($transportRequest->status),
                            ])
                            ->values(),
                    ],
                    [
                        'title' => 'Rutas sugeridas',
                        'emptyMessage' => 'No hay rutas sugeridas disponibles.',
                        'items' => $availableRoutes
                            ->map(fn (TransportRoute $route) => [
                                'title' => $route->origin.' -> '.$route->destination,
                                'meta' => $this->formatDateTime($route->departure_at).' · '.$this->formatKilograms($route->available_capacity_kg),
                            ])
                            ->values(),
                    ],
                ],
            ],
        ]);
    }

    public function admin(Request $request): Response
    {
        $pendingTransportersCount = Transporter::query()
            ->where('validation_status', Transporter::STATUS_PENDING)
            ->count();

        $pendingVehicles = Vehicle::query()
            ->with('transporter.user:id,name,phone')
            ->where('status', Vehicle::STATUS_PENDING)
            ->latest()
            ->take(4)
            ->get();

        $recentRoutes = TransportRoute::query()
            ->latest('created_at')
            ->take(4)
            ->get();

        $transportersCount = Transporter::query()->count();
        $producersCount = Producer::query()->count();
        $pendingVehiclesCount = Vehicle::query()
            ->where('status', Vehicle::STATUS_PENDING)
            ->count();
        $publishedRoutesCount = TransportRoute::query()
            ->where('status', TransportRoute::STATUS_PUBLISHED)
            ->count();
        $pendingRequestsCount = TransportRequest::query()
            ->where('status', TransportRequest::STATUS_PENDING)
            ->count();
        $confirmedServicesCount = Service::query()
            ->where('status', Service::STATUS_CONFIRMED)
            ->count();

        return Inertia::render('Dashboard', [
            'dashboardRole' => Role::ADMIN,
            'entryRoute' => null,
            'dashboardData' => [
                'hero' => [
                    'badge' => 'Panel administrador',
                    'title' => 'La operacion general ya muestra volumen real de la plataforma',
                    'subtitle' => 'Desde aqui puedes vigilar registros, validaciones pendientes, rutas publicadas y servicios confirmados.',
                ],
                'pills' => [
                    ['label' => 'Usuarios', 'value' => (string) User::query()->count()],
                    ['label' => 'Pendientes', 'value' => (string) ($pendingTransportersCount + $pendingVehiclesCount)],
                    ['label' => 'Servicios', 'value' => (string) $confirmedServicesCount],
                ],
                'spotlight' => $pendingVehicles->first()
                    ? [
                        'title' => 'Siguiente vehiculo por revisar',
                        'route' => $pendingVehicles->first()->plate,
                        'routeTo' => $pendingVehicles->first()->brand ?: 'pendiente',
                        'dateLabel' => 'Transportista: '.($pendingVehicles->first()->transporter?->user?->name ?? 'Sin nombre'),
                        'infoLabel' => 'Estado',
                        'infoValue' => $this->humanizeStatus($pendingVehicles->first()->status),
                        'statusLabel' => 'Revision necesaria',
                    ]
                    : [
                        'title' => 'Siguiente validacion sugerida',
                        'route' => 'Sin perfiles',
                        'routeTo' => 'pendientes',
                        'dateLabel' => 'No hay validaciones en espera',
                        'infoLabel' => 'Estado',
                        'infoValue' => 'Al dia',
                        'statusLabel' => 'Operacion estable',
                    ],
                'metrics' => [
                    [
                        'eyebrow' => 'Usuarios',
                        'title' => 'Transportistas',
                        'value' => (string) $transportersCount,
                        'body' => 'Perfiles de transporte registrados.',
                    ],
                    [
                        'eyebrow' => 'Usuarios',
                        'title' => 'Productores',
                        'value' => (string) $producersCount,
                        'body' => 'Productores con cuenta activa.',
                    ],
                    [
                        'eyebrow' => 'Operacion',
                        'title' => 'Vehiculos pendientes',
                        'value' => (string) $pendingVehiclesCount,
                        'body' => 'Vehiculos esperando revision documental.',
                    ],
                    [
                        'eyebrow' => 'Operacion',
                        'title' => 'Rutas publicadas',
                        'value' => (string) $publishedRoutesCount,
                        'body' => 'Rutas disponibles actualmente en la plataforma.',
                    ],
                ],
                'lists' => [
                    [
                        'title' => 'Vehiculos pendientes por revisar',
                        'emptyMessage' => 'No hay vehiculos pendientes por revisar.',
                        'items' => $pendingVehicles
                            ->map(fn (Vehicle $vehicle) => [
                                'title' => $vehicle->plate.' · '.trim(($vehicle->brand ?? '').' '.($vehicle->model ?? '')),
                                'meta' => ($vehicle->transporter?->user?->name ?? 'Transportista').' · Seguro hasta '.$this->formatDate($vehicle->insurance_expires_at).' · Tecno hasta '.$this->formatDate($vehicle->technical_review_expires_at),
                                'links' => $this->vehicleDocumentLinks($vehicle),
                                'actions' => [
                                    [
                                        'label' => 'Aprobar',
                                        'href' => route('admin.vehicles.approve', $vehicle),
                                        'type' => 'approve',
                                    ],
                                    [
                                        'label' => 'Rechazar',
                                        'href' => route('admin.vehicles.reject', $vehicle),
                                        'type' => 'reject',
                                    ],
                                ],
                            ])
                            ->values(),
                    ],
                    [
                        'title' => 'Ultimas rutas creadas',
                        'emptyMessage' => 'Aun no hay rutas registradas.',
                        'items' => $recentRoutes
                            ->map(fn (TransportRoute $route) => [
                                'title' => $route->origin.' -> '.$route->destination,
                                'meta' => $this->formatDateTime($route->departure_at).' · '.$this->humanizeStatus($route->status),
                            ])
                            ->values(),
                    ],
                ],
            ],
        ]);
    }

    private function humanizeStatus(?string $status, string $fallback = 'Sin dato'): string
    {
        return match ($status) {
            'approved' => 'Aprobado',
            'pending' => 'Pendiente',
            'rejected' => 'Rechazado',
            'published' => 'Publicada',
            'closed' => 'Cerrada',
            'cancelled' => 'Cancelada',
            'accepted' => 'Aceptada',
            'confirmed' => 'Confirmado',
            default => $status ? ucfirst($status) : $fallback,
        };
    }

    private function formatKilograms(float|int|string|null $value): string
    {
        if ($value === null || $value === '') {
            return 'Sin dato';
        }

        return rtrim(rtrim(number_format((float) $value, 2, '.', ','), '0'), '.').' kg';
    }

    private function formatDateTime($value): string
    {
        if (! $value) {
            return 'Sin fecha';
        }

        return $value->timezone(config('app.timezone'))->format('d/m/Y H:i');
    }

    private function formatDate($value): string
    {
        if (! $value) {
            return 'Sin fecha';
        }

        return $value->format('d/m/Y');
    }

    /**
     * @return array<int, array{label: string, href: string}>
     */
    private function vehicleDocumentLinks(Vehicle $vehicle): array
    {
        return collect([
            ['label' => 'Foto vehiculo', 'path' => $vehicle->vehicle_photo_path],
            ['label' => 'Licencia transito', 'path' => $vehicle->transit_license_image_path],
            ['label' => 'Seguro', 'path' => $vehicle->insurance_image_path],
            ['label' => 'Tecno-mecanica', 'path' => $vehicle->technical_review_image_path],
        ])
            ->filter(fn (array $document) => filled($document['path']))
            ->map(fn (array $document) => [
                'label' => $document['label'],
                'href' => Storage::disk('public')->url($document['path']),
            ])
            ->values()
            ->all();
    }
}
