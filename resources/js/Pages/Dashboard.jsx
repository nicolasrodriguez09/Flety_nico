import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const roleContent = {
    transportista: {
        badge: 'Panel transportista',
        title: 'Tus viajes de retorno ahora pueden convertirse en negocio',
        subtitle:
            'Prepara tu espacio de carga, revisa solicitudes y mantén tu operación clara desde un solo panel.',
        primaryLabel: 'Publicar y gestionar rutas',
        quickFilters: ['Rutas activas', 'Solicitudes', 'Historial'],
        highlightTitle: 'Viajes listos para publicar',
        highlightRoute: 'Tunja',
        highlightRouteTo: 'Bogotá',
        highlightDate: 'Próxima salida disponible',
        infoLabel: 'Capacidad sugerida',
        infoValue: '1.8 toneladas',
        cards: [
            {
                eyebrow: 'Resumen',
                title: 'Rutas preparadas',
                body: 'Consulta salidas activas, capacidad disponible y próximos movimientos.',
            },
            {
                eyebrow: 'Coordinación',
                title: 'Solicitudes pendientes',
                body: 'Centraliza productores interesados y responde desde un mismo flujo.',
            },
            {
                eyebrow: 'Confianza',
                title: 'Perfil validado',
                body: 'Documentación, contacto y trazabilidad alineados con el modelo de Flety.',
            },
        ],
    },
    productor: {
        badge: 'Panel productor',
        title: 'Encuentra rutas disponibles sin perder tiempo en coordinación dispersa',
        subtitle:
            'Busca transporte, compara opciones y mantén tus solicitudes visibles en una experiencia simple y clara.',
        primaryLabel: 'Explorar rutas disponibles',
        quickFilters: ['Nuevas rutas', 'Solicitudes', 'Historial'],
        highlightTitle: 'Ruta sugerida para tu carga',
        highlightRoute: 'Neiva',
        highlightRouteTo: 'Ibagué',
        highlightDate: 'Ventana disponible esta semana',
        infoLabel: 'Costo estimado',
        infoValue: '$420.000 - $520.000',
        cards: [
            {
                eyebrow: 'Búsqueda',
                title: 'Opciones cercanas',
                body: 'Visualiza rutas activas y filtra por origen, destino y tipo de producto.',
            },
            {
                eyebrow: 'Seguimiento',
                title: 'Solicitudes enviadas',
                body: 'Mantén el control del estado de cada solicitud sin salir del panel.',
            },
            {
                eyebrow: 'Ahorro',
                title: 'Costos más claros',
                body: 'Aprovecha viajes de retorno para reducir fricción y gasto logístico.',
            },
        ],
    },
    administrador: {
        badge: 'Panel administrador',
        title: 'Supervisa el ecosistema Flety con una vista limpia y centralizada',
        subtitle:
            'Mantén validaciones, actividad operativa y trazabilidad general dentro de una misma interfaz base.',
        primaryLabel: null,
        quickFilters: ['Validaciones', 'Actividad', 'Soporte'],
        highlightTitle: 'Operación supervisada',
        highlightRoute: 'Flujo',
        highlightRouteTo: 'General',
        highlightDate: 'Estado operativo del sistema',
        infoLabel: 'Frente prioritario',
        infoValue: 'Validación de perfiles',
        cards: [
            {
                eyebrow: 'Control',
                title: 'Usuarios y roles',
                body: 'Separa responsabilidades de productor, transportista y administrador sin cruces.',
            },
            {
                eyebrow: 'Revisión',
                title: 'Transportistas por validar',
                body: 'Prepara la base visual para el módulo de aprobaciones y documentos.',
            },
            {
                eyebrow: 'Monitoreo',
                title: 'Actividad central',
                body: 'Organiza el seguimiento del marketplace desde un solo dashboard.',
            },
        ],
    },
};

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
                <linearGradient id="trend" x1="24" y1="148" x2="396" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7FAF75" />
                    <stop offset="1" stopColor="#2F6D3E" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function Dashboard({ dashboardRole, entryRoute }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const role = dashboardRole ?? user.role?.slug;
    const content = roleContent[role] ?? roleContent.productor;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                        Centro de operaciones
                    </p>
                    <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                        {user.role?.name ? `Panel ${user.role.name}` : 'Panel Flety'}
                    </h2>
                </div>
            }
        >
            <Head title="Panel" />

            <div className="py-8 sm:py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-[2.3rem] border border-[#e7eadf] bg-[linear-gradient(180deg,#fbfbf7_0%,#f3f6ec_100%)] shadow-[0_36px_90px_-52px_rgba(42,73,57,0.42)]">
                        <div className="border-b border-[#ecefe7] bg-white/82 px-6 py-4 backdrop-blur lg:px-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src="/assets/landing/logo_flety.png"
                                        alt="Flety"
                                        className="h-12 w-auto"
                                    />
                                    <div className="hidden h-10 w-px bg-[#e6eadf] sm:block" />
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#5d7f69]">
                                            {content.badge}
                                        </p>
                                        <p className="mt-1 text-sm text-[#6b726d]">
                                            Base visual inicial para la operación de la plataforma
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e5eadf] bg-white text-[#4a5f55] shadow-[0_12px_26px_-22px_rgba(0,0,0,0.45)] transition hover:border-[#d2ddce]"
                                    >
                                        <SearchIcon />
                                    </button>

                                    {content.quickFilters.map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-2xl border border-[#e7eadf] bg-white px-4 py-2.5 text-sm font-medium text-[#4a5f55] shadow-[0_10px_24px_-22px_rgba(0,0,0,0.45)]"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden px-5 py-5 sm:px-6 lg:px-8 lg:py-8">
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(122,164,112,0.06)_100%)]" />
                            <div className="absolute inset-x-6 top-0 h-[210px] rounded-[2rem] bg-[linear-gradient(180deg,rgba(99,140,98,0.16)_0%,rgba(255,255,255,0)_100%)]" />

                            <div className="relative space-y-6">
                                <div className="rounded-[2rem] border border-[#ecf0e6] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(245,248,240,0.98)_100%)] p-6 shadow-[0_28px_70px_-54px_rgba(42,73,57,0.42)] lg:p-7">
                                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                                        <div className="space-y-5">
                                            <div className="inline-flex rounded-full border border-[#dce8d4] bg-[#f4f8ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#4f7d59]">
                                                Bienvenido
                                            </div>
                                            <div>
                                                <h3 className="max-w-[14ch] text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#1e2a25] sm:text-[3rem]">
                                                    Hola, {user.name.split(' ')[0]}.
                                                </h3>
                                                <p className="mt-4 max-w-2xl text-[1.02rem] leading-8 text-[#5b645f]">
                                                    {content.title}
                                                </p>
                                                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b726d]">
                                                    {content.subtitle}
                                                </p>
                                            </div>

                                    <div className="flex flex-wrap gap-3">
                                                <div className="rounded-2xl border border-[#e6ebdf] bg-white px-4 py-3 shadow-[0_16px_34px_-28px_rgba(0,0,0,0.4)]">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-[#7a837e]">
                                                        Rol
                                                    </p>
                                                    <p className="mt-1 font-semibold text-[#203029]">
                                                        {user.role?.name ?? 'Usuario'}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl border border-[#e6ebdf] bg-white px-4 py-3 shadow-[0_16px_34px_-28px_rgba(0,0,0,0.4)]">
                                                    <p className="text-xs uppercase tracking-[0.2em] text-[#7a837e]">
                                                        Contacto
                                                    </p>
                                                    <p className="mt-1 font-semibold text-[#203029]">
                                                        {user.phone}
                                                    </p>
                                                </div>
                                                {entryRoute ? (
                                                    <Link
                                                        href={entryRoute}
                                                        className="inline-flex items-center rounded-2xl bg-[linear-gradient(180deg,#5c9653_0%,#427c46_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_38px_-26px_rgba(66,124,70,0.82)] transition hover:translate-y-[-1px]"
                                                    >
                                                        {content.primaryLabel}
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="rounded-[2rem] border border-[#e3eadf] bg-[linear-gradient(180deg,#f7f9f2_0%,#f0f4ea_100%)] p-5 shadow-[0_20px_56px_-42px_rgba(42,73,57,0.4)]">
                                            <div className="rounded-[1.7rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(241,246,235,0.9)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                                <p className="text-sm font-semibold tracking-[-0.03em] text-[#2f6d3e]">
                                                    {content.highlightTitle}
                                                </p>

                                                <div className="mt-4 rounded-[1.5rem] border border-[#ecf0e7] bg-white/92 p-4">
                                                    <div className="flex items-center gap-3 text-[#25322d]">
                                                        <LocationIcon />
                                                        <p className="text-[1.9rem] font-semibold tracking-[-0.05em]">
                                                            {content.highlightRoute}
                                                            <span className="mx-2 text-[#86a98b]">→</span>
                                                            {content.highlightRouteTo}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-3 text-[#5f6963]">
                                                        <CalendarIcon />
                                                        <p className="text-lg font-medium">
                                                            {content.highlightDate}
                                                        </p>
                                                    </div>

                                                    <div className="mt-5 rounded-[1.3rem] bg-[linear-gradient(180deg,rgba(231,239,225,0.5)_0%,rgba(244,247,239,0.9)_100%)] px-3 py-3">
                                                        <TrendLine />
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex items-center justify-between rounded-[1.4rem] border border-[#e5ebdf] bg-white px-4 py-3">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.22em] text-[#7e867f]">
                                                            {content.infoLabel}
                                                        </p>
                                                        <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#2b4737]">
                                                            {content.infoValue}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl bg-[#edf4e8] px-3 py-2 text-sm font-semibold text-[#4c7d4f]">
                                                        Base
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <section className="grid gap-4 lg:grid-cols-3">
                                    {content.cards.map((card, index) => (
                                        <article
                                            key={card.title}
                                            className={`rounded-[1.8rem] border border-[#e6eadf] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9f3_100%)] p-6 shadow-[0_24px_62px_-50px_rgba(42,73,57,0.4)] ${
                                                index === 1
                                                    ? 'lg:translate-y-4'
                                                    : ''
                                            }`}
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7d856e]">
                                                {card.eyebrow}
                                            </p>
                                            <h3 className="mt-4 text-[1.7rem] font-semibold leading-tight tracking-[-0.05em] text-[#203029]">
                                                {card.title}
                                            </h3>
                                            <p className="mt-4 text-sm leading-7 text-[#626a65]">
                                                {card.body}
                                            </p>
                                        </article>
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
