import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import RouteMap from '@/Components/RouteMap';
import { Head, Link, router, usePage } from '@inertiajs/react';

function SearchIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M20 20L16.2 16.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 21C15.5 17.2 18 14.1 18 10.5C18 6.91015 15.3137 4 12 4C8.68629 4 6 6.91015 6 10.5C6 14.1 8.5 17.2 12 21Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 12.3C13.2147 12.3 14.2 11.3147 14.2 10.1C14.2 8.88529 13.2147 7.9 12 7.9C10.7853 7.9 9.8 8.88529 9.8 10.1C9.8 11.3147 10.7853 12.3 12 12.3Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7 4.5V7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M17 4.5V7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M5 9H19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M5.5 6.5H18.5C19.3284 6.5 20 7.17157 20 8V18C20 18.8284 19.3284 19.5 18.5 19.5H5.5C4.67157 19.5 4 18.8284 4 18V8C4 7.17157 4.67157 6.5 5.5 6.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TrendLine() {
    return (
        <svg
            aria-hidden="true"
            className="h-[180px] w-full"
            viewBox="0 0 420 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M24 148C72 145 106 142 138 132C178 118 207 86 242 78C278 70 300 90 334 84C361 79 382 53 396 30"
                stroke="url(#trend)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="24" cy="148" r="6" fill="#3F7E40" />
            <circle cx="138" cy="132" r="6" fill="#6AA46A" />
            <circle cx="242" cy="78" r="6" fill="#4F9547" />
            <circle cx="334" cy="84" r="6" fill="#6AA46A" />
            <circle cx="396" cy="30" r="7" fill="#4F9547" />
            <defs>
                <linearGradient
                    id="trend"
                    x1="24"
                    y1="148"
                    x2="396"
                    y2="30"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#7FAF75" />
                    <stop offset="1" stopColor="#2F6D3E" />
                </linearGradient>
            </defs>
        </svg>
    );
}

function DataList({ section }) {
    const actionStyles = {
        approve: 'bg-emerald-700 text-white hover:bg-emerald-600',
        reject: 'border border-rose-200 text-rose-700 hover:bg-rose-50',
    };

    return (
        <article className="animate-panel-rise rounded-2xl border border-[#dfe8dc] bg-white p-5 shadow-[0_18px_42px_-34px_rgba(31,74,49,0.35)] sm:p-6">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#203029]">
                {section.title}
            </h3>

            <div className="mt-5 space-y-3">
                {section.items?.length ? (
                    section.items.map((item, index) => (
                        <div
                            key={`${section.title}-${index}`}
                            className="rounded-xl border border-[#e1e9de] bg-[#f8fbf6] px-4 py-3"
                        >
                            <p className="font-semibold text-[#203029]">
                                {item.title}
                            </p>
                            <p className="mt-1 text-sm text-[#626a65]">
                                {item.meta}
                            </p>
                            {item.links?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.links.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-xl border border-[#dce6d8] px-3 py-2 text-xs font-semibold text-[#3f6f4b] transition hover:bg-[#f4f8ef]"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            ) : null}
                            {item.actions?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {item.actions.map((action) => (
                                        <button
                                            key={action.label}
                                            type="button"
                                            onClick={() =>
                                                router.post(action.href, {}, {
                                                    preserveScroll: true,
                                                })
                                            }
                                            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${actionStyles[action.type] ?? actionStyles.approve}`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-[#d8ddd2] px-4 py-6 text-sm text-[#69706b]">
                        {section.emptyMessage}
                    </div>
                )}
            </div>
        </article>
    );
}

function hasRouteCoordinates(route) {
    return (
        Number.isFinite(Number(route?.origin_lat)) &&
        Number.isFinite(Number(route?.origin_lng)) &&
        Number.isFinite(Number(route?.destination_lat)) &&
        Number.isFinite(Number(route?.destination_lng))
    );
}

function TransporterOperations({
    user,
    data,
    entryRoute,
    flash,
    spotlightMapRoute,
}) {
    const primaryMetrics = data.metrics ?? [];
    const routeList = data.lists?.[0];
    const requestList = data.lists?.[1];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#27613b]">
                        Cabina operativa
                    </p>
                    <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                        Bienvenido, Transportista
                    </h2>
                </div>
            }
        >
            <Head title="Panel Transportista" />

            <div className="min-h-screen bg-[linear-gradient(180deg,#e7f3e5_0%,#f5faf1_42%,#fbfcf8_100%)]">
                <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8">
                    {flash.success ? (
                        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                            {flash.success}
                        </section>
                    ) : null}
                    {flash.error ? (
                        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
                            {flash.error}
                        </section>
                    ) : null}

                    <section className="animate-panel-rise overflow-hidden rounded-2xl border border-[#cfe1cb] bg-[#163b29] text-white shadow-[0_26px_60px_-42px_rgba(16,64,38,0.7)]">
                        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
                            <div className="p-5 sm:p-7 lg:p-8">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a9d49e]">
                                            {data.hero.badge}
                                        </p>
                                        <h3 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                                            Ruta activa y solicitudes en un solo lugar
                                        </h3>
                                        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d9ead3]">
                                            {data.hero.subtitle}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-[#eef8e9]">
                                        <p className="text-xs uppercase tracking-[0.18em] text-[#b8ddb0]">
                                            Conductor
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {user.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    {primaryMetrics.map((metric) => (
                                        <article
                                            key={metric.title}
                                            className="rounded-2xl border border-white/12 bg-white/9 p-4"
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9d49e]">
                                                {metric.eyebrow}
                                            </p>
                                            <p className="mt-3 text-3xl font-semibold">
                                                {metric.value}
                                            </p>
                                            <p className="mt-2 text-sm leading-5 text-[#dcebd6]">
                                                {metric.title}
                                            </p>
                                        </article>
                                    ))}
                                </div>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                    {entryRoute ? (
                                        <Link
                                            href={entryRoute}
                                            className="interactive-lift inline-flex justify-center rounded-2xl bg-[#7dbf59] px-5 py-4 text-sm font-semibold text-[#123420] transition hover:bg-[#8ecb6d]"
                                        >
                                            Gestionar rutas y solicitudes
                                        </Link>
                                    ) : null}
                                    <Link
                                        href={route('transporter.vehicles.create')}
                                        className="inline-flex justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-semibold text-white transition hover:bg-white/15"
                                    >
                                        Registrar vehiculo
                                    </Link>
                                </div>
                            </div>

                            <div className="border-t border-white/10 bg-[#214c34] p-4 sm:p-6 xl:border-l xl:border-t-0">
                                <div className="rounded-2xl border border-white/12 bg-white p-4 text-[#203029] shadow-[0_24px_48px_-34px_rgba(0,0,0,0.45)]">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                                {data.spotlight.title}
                                            </p>
                                            <h3 className="mt-3 text-2xl font-semibold leading-tight">
                                                {data.spotlight.route}
                                                <span className="mx-2 text-[#86a98b]">
                                                    {'->'}
                                                </span>
                                                {data.spotlight.routeTo}
                                            </h3>
                                            <p className="mt-2 text-sm font-medium text-[#52615a]">
                                                {data.spotlight.dateLabel}
                                            </p>
                                        </div>
                                        <span className="rounded-xl bg-[#edf4e8] px-3 py-2 text-sm font-semibold text-[#427c46]">
                                            {data.spotlight.statusLabel}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl bg-[#f3f8ef] px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d856e]">
                                                Capacidad
                                            </p>
                                            <p className="mt-2 font-semibold text-[#203029]">
                                                {data.spotlight.infoValue}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-[#f3f8ef] px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d856e]">
                                                Vehiculo
                                            </p>
                                            <p className="mt-2 font-semibold text-[#203029]">
                                                {data.spotlight.vehicleLabel}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-[#f3f8ef] px-4 py-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d856e]">
                                                Solicitudes
                                            </p>
                                            <p className="mt-2 font-semibold text-[#203029]">
                                                {data.spotlight.requestsLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 overflow-hidden rounded-xl border border-[#dce8d8] bg-[#f4f8ef] p-2">
                                        {spotlightMapRoute ? (
                                            <RouteMap
                                                routes={[spotlightMapRoute]}
                                                height="300px"
                                            />
                                        ) : (
                                            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-[#cfe1cb] bg-[#f8fbf6] px-6 text-center text-sm text-[#647067]">
                                                Publica una ruta con puntos de mapa para ver el trayecto aqui.
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-4 rounded-xl bg-[#edf4e8] px-4 py-3 text-sm font-medium text-[#3f6f4b]">
                                        Carga permitida: {data.spotlight.cargoLabel}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                        <article className="animate-panel-rise rounded-2xl border border-[#dfe8dc] bg-white p-5 shadow-[0_18px_42px_-34px_rgba(31,74,49,0.35)] sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                        Rutas
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold text-[#203029]">
                                        Ultimas publicaciones
                                    </h3>
                                </div>
                                {entryRoute ? (
                                    <Link
                                        href={entryRoute}
                                        className="rounded-xl border border-[#dce6d8] px-4 py-3 text-sm font-semibold text-[#3f6f4b] transition hover:bg-[#f4f8ef]"
                                    >
                                        Editar rutas
                                    </Link>
                                ) : null}
                            </div>

                            <div className="mt-5 space-y-3">
                                {routeList?.items?.length ? (
                                    routeList.items.map((item, index) => (
                                        <div
                                            key={`${routeList.title}-${index}`}
                                            className="rounded-2xl border border-[#e1e9de] bg-[#f8fbf6] px-4 py-4"
                                        >
                                            <p className="font-semibold text-[#203029]">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-sm text-[#626a65]">
                                                {item.meta}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[#d8ddd2] px-4 py-7 text-sm text-[#69706b]">
                                        {routeList?.emptyMessage}
                                    </div>
                                )}
                            </div>
                        </article>

                        <article className="animate-panel-rise rounded-2xl border border-[#cfe1cb] bg-[#f7fbf4] p-5 shadow-[0_18px_42px_-34px_rgba(31,74,49,0.35)] sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                        Solicitudes
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold text-[#203029]">
                                        Productores esperando respuesta
                                    </h3>
                                </div>
                                <span className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#427c46]">
                                    Atencion rapida
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                {requestList?.items?.length ? (
                                    requestList.items.map((item, index) => (
                                        <div
                                            key={`${requestList.title}-${index}`}
                                            className="rounded-2xl border border-[#d9e8d4] bg-white px-4 py-4"
                                        >
                                            <p className="font-semibold text-[#203029]">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-sm text-[#626a65]">
                                                {item.meta}
                                            </p>
                                            {item.actions?.length ? (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {item.actions.map((action) => (
                                                        <button
                                                            key={action.label}
                                                            type="button"
                                                            onClick={() =>
                                                                router.post(action.href, {}, {
                                                                    preserveScroll: true,
                                                                })
                                                            }
                                                            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                                                action.type === 'reject'
                                                                    ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                                                                    : 'bg-emerald-700 text-white hover:bg-emerald-600'
                                                            }`}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[#d8ddd2] bg-white px-4 py-7 text-sm text-[#69706b]">
                                        {requestList?.emptyMessage}
                                    </div>
                                )}
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default function Dashboard({ dashboardRole, entryRoute, dashboardData }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const role = dashboardRole ?? user.role?.slug;
    const data = dashboardData ?? {
        hero: {
            badge: `Panel ${role ?? 'Flety'}`,
            title: 'Panel operativo',
            subtitle: 'Aun no hay informacion suficiente para mostrar.',
        },
        pills: [],
        spotlight: {
            title: 'Resumen',
            route: 'Sin datos',
            routeTo: 'disponibles',
            dateLabel: 'Sin actividad',
            infoLabel: 'Estado',
            infoValue: 'Pendiente',
            statusLabel: 'Base',
            mapRoute: null,
        },
        metrics: [],
        lists: [],
    };
    const spotlightMapRoute = hasRouteCoordinates(data.spotlight.mapRoute)
        ? data.spotlight.mapRoute
        : null;

    if (role === 'transportista') {
        return (
            <TransporterOperations
                user={user}
                data={data}
                entryRoute={entryRoute}
                flash={flash}
                spotlightMapRoute={spotlightMapRoute}
            />
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#427c46]">
                        Centro de operaciones
                    </p>
                    <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                        {user.role?.name ? `Panel ${user.role.name}` : 'Panel Flety'}
                    </h2>
                </div>
            }
        >
            <Head title="Panel" />

            <div className="bg-[linear-gradient(180deg,#eef7ec_0%,#f7faf4_44%,#fbfcf8_100%)]">
                <div className="space-y-0">
                    {flash.success ? (
                        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                            {flash.success}
                        </section>
                    ) : null}
                    {flash.error ? (
                        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
                            {flash.error}
                        </section>
                    ) : null}

                    <section className="animate-panel-rise overflow-hidden bg-[#f7faf4]">
                        <div className="border-b border-[#e5ebdf] bg-white/95 px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src="/assets/landing/logo_flety.png"
                                        alt="Flety"
                                        className="h-12 w-auto"
                                    />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                            {data.hero.badge}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-[#52615a]">
                                            Informacion funcional cargada desde la base de datos
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {data.pills.slice(0, 3).map((item) => (
                                        <div
                                            key={item.label}
                                            className="rounded-2xl border border-[#e5ebdf] bg-[#f8faf5] px-4 py-2 text-sm font-medium text-[#31473c]"
                                        >
                                            <span className="text-[#7b887f]">
                                                {item.label}:{' '}
                                            </span>
                                            {item.value}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e1e8dc] bg-white text-[#2f6d3e] transition hover:bg-[#f4f8ef]"
                                    >
                                        <SearchIcon />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[linear-gradient(135deg,#e8f4e5_0%,#f2f8ef_48%,#f8fbf6_100%)]">
                            <div className="space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
                                <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                                    <div className="space-y-4 xl:sticky xl:top-24">
                                        <div className="animate-panel-rise rounded-2xl border border-[#d8e8d4] bg-white/82 p-5 shadow-[0_18px_44px_-36px_rgba(31,74,49,0.4)]">
                                            <h3 className="text-3xl font-semibold leading-tight text-[#203029] sm:text-[2.25rem]">
                                                Bienvenido,{' '}
                                                {user.name.split(' ')[0]}
                                            </h3>
                                            <p className="mt-3 text-sm leading-6 text-[#52615a]">
                                                {data.hero.subtitle}
                                            </p>
                                        </div>

                                        <div className="animate-panel-rise stagger-1 rounded-2xl border border-[#d8e8d4] bg-white p-2 shadow-[0_18px_44px_-36px_rgba(31,74,49,0.4)]">
                                            <div className="flex items-center justify-between rounded-xl border-b border-[#edf2e9] px-4 py-3 text-[#52615a]">
                                                <span className="inline-flex items-center gap-3">
                                                    <LocationIcon />
                                                    {data.spotlight.route}
                                                </span>
                                                <span className="text-xl text-[#8a968f]">
                                                    {'>'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3 text-[#52615a]">
                                                <span className="inline-flex items-center gap-3">
                                                    <CalendarIcon />
                                                    {data.spotlight.routeTo}
                                                </span>
                                                <span className="text-xl text-[#8a968f]">
                                                    {'>'}
                                                </span>
                                            </div>
                                        </div>

                                        {entryRoute ? (
                                            <Link
                                                href={entryRoute}
                                                className="interactive-lift inline-flex w-full justify-center rounded-xl bg-[#427c46] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_38px_-30px_rgba(66,124,70,0.75)] transition hover:bg-[#356b3f]"
                                            >
                                                Ir al modulo operativo
                                            </Link>
                                        ) : null}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="animate-panel-rise stagger-1 rounded-2xl border border-[#d8e8d4] bg-white p-4 shadow-[0_18px_44px_-36px_rgba(31,74,49,0.4)] lg:p-5">
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-[#2f6d3e]">
                                                        {data.spotlight.title}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[#25322d]">
                                                        <LocationIcon />
                                                        <p className="text-2xl font-semibold leading-tight sm:text-[1.8rem]">
                                                            {data.spotlight.route}
                                                            <span className="mx-2 text-[#86a98b]">
                                                                {'->'}
                                                            </span>
                                                            {data.spotlight.routeTo}
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-3 text-[#5f6963]">
                                                        <CalendarIcon />
                                                        <p className="font-medium">
                                                            {data.spotlight.dateLabel}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="rounded-xl bg-[#edf4e8] px-3 py-2 text-sm font-semibold text-[#4c7d4f]">
                                                    {data.spotlight.statusLabel}
                                                </div>
                                            </div>

                                            <div className="mt-4 overflow-hidden rounded-xl border border-[#dce8d8] bg-[#f4f8ef] p-2">
                                                {spotlightMapRoute ? (
                                                    <RouteMap
                                                        routes={[spotlightMapRoute]}
                                                        height="250px"
                                                    />
                                                ) : (
                                                    <TrendLine />
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                            {data.metrics.map((metric) => (
                                                <article
                                                    key={metric.title}
                                                    className="interactive-lift animate-panel-rise rounded-xl border border-[#d8e8d4] bg-white p-4 shadow-[0_16px_36px_-30px_rgba(31,74,49,0.35)]"
                                                >
                                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7d856e]">
                                                        {metric.eyebrow}
                                                    </p>
                                                    <h3 className="mt-3 text-sm font-semibold leading-tight text-[#203029]">
                                                        {metric.title}
                                                    </h3>
                                                    <p className="mt-3 text-2xl font-semibold text-[#2f6d3e]">
                                                        {metric.value}
                                                    </p>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <section className="grid gap-4 lg:grid-cols-2">
                                    {data.lists.map((section) => (
                                        <DataList
                                            key={section.title}
                                            section={section}
                                        />
                                    ))}
                                </section>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
