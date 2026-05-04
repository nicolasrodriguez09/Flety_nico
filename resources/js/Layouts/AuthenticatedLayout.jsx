import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const roleSlug = user.role?.slug;
    const dashboardHref =
        roleSlug === 'transportista'
            ? route('transporter.dashboard')
            : roleSlug === 'productor'
              ? route('producer.dashboard')
              : route('admin.dashboard');
    const routesHref =
        roleSlug === 'transportista'
            ? route('transporter.routes.index')
            : roleSlug === 'productor'
              ? route('producer.routes.index')
              : null;
    const canManageVehicles = roleSlug === 'transportista';
    const moduleLinks =
        roleSlug === 'administrador'
            ? [
                  {
                      label: 'Validar transportistas',
                      href: route('admin.transporters.index'),
                      active: route().current('admin.transporters.*'),
                  },
                  {
                      label: 'Panel administrador',
                      href: route('admin.dashboard'),
                      active: route().current('admin.dashboard'),
                  },
              ]
            : roleSlug === 'transportista'
              ? [
                    {
                        label: 'Rutas y solicitudes',
                        href: route('transporter.routes.index'),
                        active: route().current('transporter.routes.index'),
                    },
                    {
                        label: 'Registrar vehiculo',
                        href: route('transporter.vehicles.create'),
                        active: route().current('transporter.vehicles.*'),
                    },
                    {
                        label: 'Panel transportista',
                        href: route('transporter.dashboard'),
                        active: route().current('transporter.dashboard'),
                    },
                ]
              : [
                    {
                        label: 'Rutas disponibles',
                        href: route('producer.routes.index'),
                        active: route().current('producer.routes.index'),
                    },
                    {
                        label: 'Panel productor',
                        href: route('producer.dashboard'),
                        active: route().current('producer.dashboard'),
                    },
                ];

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showingModuleMenu, setShowingModuleMenu] = useState(false);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#eef7ec_0%,#f6faf3_42%,#fbfcf8_100%)] text-[#203029]">
            <nav className="sticky top-0 z-40 border-b border-[#dfe8dc] bg-white/96 shadow-[0_14px_34px_-30px_rgba(31,74,49,0.45)] backdrop-blur">
                <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setShowingModuleMenu(true)}
                                    className="interactive-lift mr-4 inline-flex h-12 items-center gap-3 rounded-2xl border border-[#cfe2ca] bg-[#f2f8ef] px-4 text-base font-semibold text-[#356b3f] shadow-[0_16px_34px_-28px_rgba(66,124,70,0.65)] hover:border-[#b8d5b1] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#9cc895]/50 sm:h-[3.25rem]"
                                    aria-label="Abrir modulos"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M5 7H19"
                                            stroke="currentColor"
                                            strokeWidth="1.9"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M5 12H19"
                                            stroke="currentColor"
                                            strokeWidth="1.9"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M5 17H15"
                                            stroke="currentColor"
                                            strokeWidth="1.9"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="hidden sm:inline">Menu</span>
                                </button>
                            </div>
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <div className="flex items-center gap-3">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-emerald-700" />
                                        <div className="hidden sm:block">
                                            <div className="text-sm font-semibold tracking-[0.2em] text-emerald-700">
                                                FLETY
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Marketplace logistico agricola
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden items-center sm:ms-8 sm:flex">
                                <button
                                    type="button"
                                    onClick={() => setShowingModuleMenu(true)}
                                    className="interactive-lift inline-flex items-center gap-2 rounded-xl border border-[#d8e8d4] bg-white px-4 py-2 text-sm font-semibold text-[#356b3f] transition hover:border-[#c7dcc2] hover:bg-[#f8fbf6]"
                                >
                                    <span className="h-2 w-2 rounded-full bg-[#427c46]" />
                                    Modulos
                                </button>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="rounded-full border border-[#d8e8d4] bg-[#f2f8ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#356b3f]">
                                {user.role?.name ?? 'Usuario'}
                            </div>
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                            className="interactive-lift inline-flex items-center gap-2 rounded-xl border border-[#dfe7da] bg-white px-4 py-2.5 text-sm font-semibold leading-4 text-[#32473d] transition duration-150 ease-in-out hover:border-[#cbdac7] hover:bg-[#f8fbf6] focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="h-4 w-4 text-[#5e7569]"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content
                                        contentClasses="overflow-hidden rounded-2xl border border-[#dfe7da] bg-white py-2 shadow-[0_26px_60px_-34px_rgba(0,0,0,0.38)]"
                                    >
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                            className="px-4 py-3 font-medium text-[#32473d] hover:bg-[#f3f8ef] focus:bg-[#f3f8ef]"
                                        >
                                            Perfil
                                        </Dropdown.Link>
                                        {canManageVehicles ? (
                                            <Dropdown.Link
                                                href={route(
                                                    'transporter.vehicles.create',
                                                )}
                                                className="px-4 py-3 font-medium text-[#32473d] hover:bg-[#f3f8ef] focus:bg-[#f3f8ef]"
                                            >
                                                Registrar vehiculo
                                            </Dropdown.Link>
                                        ) : null}
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="px-4 py-3 font-medium text-[#32473d] hover:bg-[#f8f3ef] focus:bg-[#f8f3ef]"
                                        >
                                            Cerrar sesion
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={dashboardHref}
                            active={
                                route().current('transporter.dashboard') ||
                                route().current('producer.dashboard') ||
                                route().current('admin.dashboard')
                            }
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        {routesHref ? (
                            <ResponsiveNavLink
                                href={routesHref}
                                active={
                                    route().current('transporter.routes.index') ||
                                    route().current('producer.routes.index')
                                }
                            >
                                Rutas
                            </ResponsiveNavLink>
                        ) : null}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                {user.role?.name ?? 'Usuario'}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            {canManageVehicles ? (
                                <ResponsiveNavLink
                                    href={route('transporter.vehicles.create')}
                                >
                                    Registrar vehiculo
                                </ResponsiveNavLink>
                            ) : null}
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar sesion
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {showingModuleMenu ? (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        className="animate-overlay-in absolute inset-0 bg-[#203029]/35"
                        aria-label="Cerrar menu de modulos"
                        onClick={() => setShowingModuleMenu(false)}
                    />
                    <aside className="animate-drawer-in absolute left-0 top-0 flex h-full w-[min(23.5rem,calc(100vw-1.25rem))] flex-col border-r border-[#dfe8dc] bg-[#fbfcf8] shadow-[28px_0_70px_-48px_rgba(31,74,49,0.5)]">
                        <div className="border-b border-[#dfe8dc] bg-white px-5 py-5">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d8e8d4] bg-[#f2f8ef]">
                                        <ApplicationLogo className="h-7 w-auto fill-current text-[#427c46]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                            Flety
                                        </p>
                                        <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                            Menu operativo
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowingModuleMenu(false)}
                                    className="interactive-lift inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe8dc] bg-white text-[#5e7569] transition hover:bg-[#f8fbf6]"
                                    aria-label="Cerrar modulos"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M6 6L18 18"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M18 6L6 18"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-5 rounded-2xl border border-[#d8e8d4] bg-[linear-gradient(180deg,#f2f8ef_0%,#ffffff_100%)] px-4 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#356b3f]">
                                            {user.role?.name ?? 'Usuario'}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {user.name}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#427c46]">
                                        Activo
                                    </span>
                                </div>
                                <p className="mt-3 text-xs leading-5 text-[#66746d]">
                                    Accede rapidamente a las areas disponibles para tu rol.
                                </p>
                            </div>
                        </div>

                        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
                            {moduleLinks.map((module) => (
                                <Link
                                    key={module.href}
                                    href={module.href}
                                    onClick={() => setShowingModuleMenu(false)}
                                    className={`interactive-lift group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                        module.active
                                            ? 'bg-[#427c46] text-white shadow-[0_18px_34px_-28px_rgba(66,124,70,0.65)]'
                                            : 'border border-[#dfe8dc] bg-white text-[#42534a] hover:border-[#cbdac7] hover:bg-[#f8fbf6]'
                                    }`}
                                >
                                    <span className="inline-flex items-center gap-3">
                                        <span
                                            className={`h-2.5 w-2.5 rounded-full ${
                                                module.active
                                                    ? 'bg-white'
                                                    : 'bg-[#9fbd99] group-hover:bg-[#427c46]'
                                            }`}
                                        />
                                        {module.label}
                                    </span>
                                    <span
                                        className={
                                            module.active
                                                ? 'text-white/75'
                                                : 'text-[#9aa89f]'
                                        }
                                    >
                                        {'>'}
                                    </span>
                                </Link>
                            ))}
                        </nav>

                        <div className="border-t border-[#dfe8dc] bg-white px-4 py-4">
                            <Link
                                href={route('profile.edit')}
                                onClick={() => setShowingModuleMenu(false)}
                                className="interactive-lift block rounded-xl border border-[#dfe8dc] px-4 py-3 text-sm font-semibold text-[#42534a] transition hover:bg-[#f8fbf6]"
                            >
                                Configurar perfil
                            </Link>
                        </div>
                    </aside>
                </div>
            ) : null}

            {header && (
                <header className="border-b border-[#dfe8dc] bg-white/96 shadow-[0_14px_34px_-30px_rgba(31,74,49,0.45)] backdrop-blur">
                    <div className="mx-auto max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="animate-app-page-in">{children}</main>
        </div>
    );
}
