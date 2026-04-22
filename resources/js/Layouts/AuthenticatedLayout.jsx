import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const dashboardHref =
        user.role?.slug === 'transportista'
            ? route('transporter.dashboard')
            : user.role?.slug === 'productor'
              ? route('producer.dashboard')
              : route('admin.dashboard');
    const routesHref =
        user.role?.slug === 'transportista'
            ? route('transporter.routes.index')
            : user.role?.slug === 'productor'
              ? route('producer.routes.index')
              : null;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ea_0%,#eef4ea_46%,#f6f8f2_100%)]">
            <nav className="border-b border-emerald-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
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

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={dashboardHref}
                                    active={
                                        route().current('transporter.dashboard') ||
                                        route().current('producer.dashboard') ||
                                        route().current('admin.dashboard')
                                    }
                                >
                                    Panel
                                </NavLink>
                                {routesHref ? (
                                    <NavLink
                                        href={routesHref}
                                        active={
                                            route().current('transporter.routes.index') ||
                                            route().current('producer.routes.index')
                                        }
                                    >
                                        Rutas
                                    </NavLink>
                                ) : null}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                                {user.role?.name ?? 'Usuario'}
                            </div>
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-2xl border border-[#dfe7da] bg-white px-4 py-2.5 text-sm font-semibold leading-4 text-[#32473d] shadow-[0_16px_32px_-26px_rgba(0,0,0,0.38)] transition duration-150 ease-in-out hover:border-[#cfdac8] hover:bg-[#fbfdf9] focus:outline-none"
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

            {header && (
                <header className="border-b border-[#edf1ea] bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
