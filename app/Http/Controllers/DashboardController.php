<?php

namespace App\Http\Controllers;

use App\Models\Producer;
use App\Models\Role;
use App\Models\Service;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use App\Models\Transporter;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
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
                    ]
                    : [
                        'title' => 'Ruta disponible mas cercana',
                        'route' => 'Sin rutas',
                        'routeTo' => 'publicadas',
                        'dateLabel' => 'Aun no hay rutas futuras disponibles',
                        'infoLabel' => 'Capacidad disponible',
                        'infoValue' => 'Pendiente',
                        'statusLabel' => 'Sin actividad',
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

        $pendingTransporters = Transporter::query()
            ->with('user:id,name,phone')
            ->where('validation_status', Transporter::STATUS_PENDING)
            ->latest()
            ->take(4)
            ->get();

        $recentRoutes = TransportRoute::query()
            ->latest('created_at')
            ->take(4)
            ->get();

        $transportersCount = Transporter::query()->count();
        $producersCount = Producer::query()->count();
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
                    ['label' => 'Pendientes', 'value' => (string) $pendingTransportersCount],
                    ['label' => 'Servicios', 'value' => (string) $confirmedServicesCount],
                ],
                'spotlight' => $pendingTransporters->first()
                    ? [
                        'title' => 'Siguiente validacion sugerida',
                        'route' => $pendingTransporters->first()->user?->name ?? 'Transportista',
                        'routeTo' => 'pendiente',
                        'dateLabel' => 'Telefono: '.($pendingTransporters->first()->user?->phone ?? 'Sin telefono'),
                        'infoLabel' => 'Estado',
                        'infoValue' => $this->humanizeStatus($pendingTransporters->first()->validation_status),
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
                        'title' => 'Rutas publicadas',
                        'value' => (string) $publishedRoutesCount,
                        'body' => 'Rutas disponibles actualmente en la plataforma.',
                    ],
                    [
                        'eyebrow' => 'Operacion',
                        'title' => 'Solicitudes pendientes',
                        'value' => (string) $pendingRequestsCount,
                        'body' => 'Solicitudes que aun esperan respuesta.',
                    ],
                ],
                'lists' => [
                    [
                        'title' => 'Transportistas pendientes por validar',
                        'emptyMessage' => 'No hay transportistas pendientes por revisar.',
                        'items' => $pendingTransporters
                            ->map(fn (Transporter $transporter) => [
                                'title' => $transporter->user?->name ?? 'Transportista',
                                'meta' => $transporter->user?->phone ?? 'Sin telefono',
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
}
