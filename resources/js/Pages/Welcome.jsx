import { Head, Link } from '@inertiajs/react';

const features = [
    {
        title: 'Encuentra Viajes',
        description:
            'Busca rutas de retorno con espacio disponible cerca de ti.',
        icon: '/assets/landing/icono_encuentra_viajes.png',
    },
    {
        title: 'Asegura Transporte',
        description:
            'Solicita transporte de forma simple y espera confirmacion.',
        icon: '/assets/landing/icono_asegura_transporte.png',
    },
    {
        title: 'Ahorra y Aprovecha',
        description:
            'Utiliza viajes vacios y reduce costos de transporte.',
        icon: '/assets/landing/icono_ahorra_aprovecha.png',
    },
];

function ArrowRightIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7 4L13 10L7 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TruckMiniIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M3 7.5H14V15H3V7.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 10.5H18L20.5 13V15H14V10.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7 17.5C7 18.3284 6.32843 19 5.5 19C4.67157 19 4 18.3284 4 17.5C4 16.6716 4.67157 16 5.5 16C6.32843 16 7 16.6716 7 17.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M19 17.5C19 18.3284 18.3284 19 17.5 19C16.6716 19 16 18.3284 16 17.5C16 16.6716 16.6716 16 17.5 16C18.3284 16 19 16.6716 19 17.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M5 10H10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M5 12.5H8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LeafMiniIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M18.5 5C12.5 5.3 8 9.6 8 15V19C14.1 19 19 14.1 19 8V5.5C19 5.22386 18.7761 5 18.5 5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 19C8 13.5 5.2 10 2 8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M8 14C5.2 14 3.2 12.9 2 11"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function Welcome({ auth, canLogin, canRegister }) {
    const user = auth?.user;
    const registerUrl = route('register');
    const transporterRegisterUrl = route('register', { role: 'transportista' });
    const producerRegisterUrl = route('register', { role: 'productor' });

    return (
        <>
            <Head title="Flety" />

            <div className="min-h-screen bg-[#fbfaf6] text-[#29463d]">
                <main className="w-full pb-16 pt-0 lg:pb-24">
                    <section className="relative overflow-hidden border border-[#dbe5d6] shadow-[0_28px_80px_-42px_rgba(61,97,79,0.45)]">
                        <img
                            src="/assets/landing/fondo.png"
                            alt="Fondo principal de Flety"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(21,42,36,0.88)_0%,rgba(27,57,46,0.78)_38%,rgba(33,69,55,0.38)_63%,rgba(255,255,255,0)_100%)]" />
                        <div className="animate-drift-soft absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,222,140,0.18),rgba(255,255,255,0)_32%)]" />
                        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
                            <nav className="animate-fade-left flex flex-wrap items-center justify-end gap-3">
                                {user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="hover-lift-soft inline-flex items-center rounded-2xl bg-[#4f9547] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(79,149,71,0.75)] transition hover:bg-[#46863f]"
                                    >
                                        Ir al panel
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link
                                                href={route('login')}
                                                className="hover-lift-soft inline-flex items-center rounded-2xl border border-white/16 bg-white/10 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_40px_-30px_rgba(0,0,0,0.55)] backdrop-blur transition hover:bg-white/14"
                                            >
                                                Iniciar sesion
                                            </Link>
                                        )}

                                        {canRegister && (
                                            <Link
                                                href={registerUrl}
                                                className="hover-lift-soft animate-glow-soft inline-flex items-center gap-3 rounded-2xl bg-[#4f9547] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(79,149,71,0.8)] transition hover:bg-[#46863f]"
                                            >
                                                Registrate
                                                <ArrowRightIcon />
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="relative z-10 grid min-h-[560px] items-end gap-10 px-6 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:pb-12 lg:pt-12">
                            <div className="max-w-[640px] space-y-8">
                                <div className="animate-fade-up inline-flex items-center gap-4 rounded-[28px] border border-white/14 bg-white/10 px-4 py-4 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.6)] backdrop-blur">
                                    <div className="rounded-[22px] bg-white px-4 py-3 shadow-[0_14px_38px_-28px_rgba(0,0,0,0.45)]">
                                        <img
                                            src="/assets/landing/logo_flety.png"
                                            alt="Logo Flety"
                                            className="h-12 w-auto sm:h-14"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#ffe9a8]">
                                            Marketplace PWA
                                        </p>
                                        <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
                                            Flety
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <p className="animate-fade-up stagger-1 inline-flex rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#f8efc7] backdrop-blur">
                                        Logistica agricola inteligente
                                    </p>
                                    <h1 className="animate-fade-up stagger-2 max-w-[12ch] text-[2.8rem] font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-[4rem] lg:text-[4.9rem]">
                                        Conecta rutas libres con productores que necesitan mover carga
                                    </h1>
                                    <p className="animate-fade-up stagger-3 max-w-[36rem] text-[1.05rem] leading-8 text-white/82 sm:text-[1.16rem]">
                                        Aprovecha viajes de retorno, reduce costos
                                        de transporte y conecta oferta y demanda en
                                        una sola plataforma pensada para el sector
                                        rural.
                                    </p>
                                </div>

                                <div className="animate-fade-up stagger-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                                    {user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="hover-lift-soft inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#4f9547_0%,#3f7e40_100%)] px-7 py-4 text-base font-semibold text-white shadow-[0_22px_50px_-30px_rgba(79,149,71,0.9)] transition hover:translate-y-[-1px] hover:brightness-[1.03]"
                                        >
                                            Ir al panel
                                        </Link>
                                    ) : (
                                        canRegister && (
                                            <Link
                                                href={registerUrl}
                                                className="hover-lift-soft animate-glow-soft inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(180deg,#5aa24f_0%,#3f7e40_100%)] px-7 py-4 text-base font-semibold text-white shadow-[0_22px_50px_-30px_rgba(79,149,71,0.9)] transition hover:translate-y-[-1px] hover:brightness-[1.03]"
                                            >
                                                Registrate
                                                <ArrowRightIcon />
                                            </Link>
                                        )
                                    )}

                                    <a
                                        href="#mas-informacion"
                                        className="hover-lift-soft inline-flex items-center justify-center rounded-2xl border border-white/18 bg-white/10 px-7 py-4 text-base font-semibold text-white shadow-[0_22px_50px_-34px_rgba(0,0,0,0.55)] backdrop-blur transition hover:bg-white/14"
                                    >
                                        Mas informacion
                                    </a>
                                </div>
                            </div>

                            <div className="animate-fade-left stagger-2 flex justify-start lg:justify-end">
                                <div className="grid w-full max-w-[360px] gap-4">
                                    <article className="hover-lift-soft rounded-[28px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)] p-5 text-white shadow-[0_24px_70px_-46px_rgba(0,0,0,0.75)] backdrop-blur">
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f7efc9]">
                                            Beneficio real
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                                            Menos viajes vacios, mas oportunidades
                                        </p>
                                    </article>

                                    <article className="hover-lift-soft rounded-[28px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,248,223,0.94)_0%,rgba(247,241,216,0.86)_100%)] p-5 text-[#2e463d] shadow-[0_24px_70px_-46px_rgba(0,0,0,0.55)]">
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7d6a2f]">
                                            En un vistazo
                                        </p>
                                        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                                            <div>
                                                <p className="text-3xl font-semibold tracking-[-0.05em]">
                                                    3
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-[#58665f]">
                                                    roles operativos bien definidos
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-3xl font-semibold tracking-[-0.05em]">
                                                    1
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-[#58665f]">
                                                    flujo unificado para rutas y solicitudes
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-3xl font-semibold tracking-[-0.05em]">
                                                    100%
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-[#58665f]">
                                                    enfocado en transporte agricola
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="animate-fade-up relative -mt-3 rounded-[34px] bg-white px-6 pb-12 pt-10 shadow-[0_28px_80px_-50px_rgba(61,97,79,0.32)] sm:px-8 lg:px-10">
                        <div className="grid gap-8 text-center md:grid-cols-3 md:gap-10">
                            {features.map((feature, index) => (
                                <article
                                    key={feature.title}
                                    className={`animate-fade-up hover-lift-soft flex flex-col items-center ${
                                        index === 0
                                            ? 'stagger-1'
                                            : index === 1
                                              ? 'stagger-2'
                                              : 'stagger-3'
                                    }`}
                                >
                                    <img
                                        src={feature.icon}
                                        alt={feature.title}
                                        className="h-[92px] w-auto object-contain"
                                    />
                                    <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.03em] text-[#4c8753] sm:text-[2.15rem] md:text-[2.05rem]">
                                        {feature.title}
                                    </h2>
                                    <p className="mt-3 max-w-[18rem] text-[1.05rem] leading-8 text-[#485953] sm:text-[1.15rem]">
                                        {feature.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section
                        id="mas-informacion"
                        className="animate-fade-up relative mt-10 overflow-hidden rounded-[34px] border border-[#efe8dc] bg-[radial-gradient(circle_at_top,rgba(255,255,255,1),rgba(247,244,236,1)_62%,rgba(245,240,232,1)_100%)] px-6 py-14 shadow-[0_24px_70px_-48px_rgba(61,97,79,0.35)] sm:px-8 lg:px-12 lg:py-16"
                    >
                        <div className="animate-drift-soft absolute left-1/2 top-8 h-44 w-44 -translate-x-1/2 rounded-full bg-[#fff7d5] opacity-70 blur-3xl" />
                        <div className="relative text-center">
                            <h2 className="animate-fade-up text-[2.45rem] font-semibold tracking-[-0.04em] text-[#23453c] sm:text-[2.9rem]">
                                Nuevo en Flety?
                            </h2>
                            <p className="animate-fade-up stagger-1 mt-3 text-[2rem] font-semibold tracking-[-0.03em] text-[#2d4c43] sm:text-[2.35rem]">
                                Conecta y transporta en solo unos pasos
                            </p>
                            <p className="animate-fade-up stagger-2 mt-5 text-[1.1rem] text-[#616660] sm:text-[1.25rem]">
                                Empieza creando una cuenta:
                            </p>

                            <div className="mt-8 grid gap-4 sm:mx-auto sm:max-w-[640px] sm:grid-cols-2">
                                <Link
                                    href={transporterRegisterUrl}
                                    className="animate-fade-up stagger-3 hover-lift-soft inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(180deg,#ffa73e_0%,#ff8a1d_100%)] px-6 py-4 text-[1.1rem] font-semibold text-white shadow-[0_18px_42px_-28px_rgba(255,138,29,0.8)] transition hover:translate-y-[-1px]"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                                        <TruckMiniIcon />
                                    </span>
                                    Soy Transportista
                                </Link>

                                <Link
                                    href={producerRegisterUrl}
                                    className="animate-fade-up stagger-4 hover-lift-soft inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(180deg,#ffd24d_0%,#ffb92c_100%)] px-6 py-4 text-[1.1rem] font-semibold text-white shadow-[0_18px_42px_-28px_rgba(255,185,44,0.8)] transition hover:translate-y-[-1px]"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                                        <LeafMiniIcon />
                                    </span>
                                    Soy Productor
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="mt-10 grid gap-5 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <article
                                key={`${feature.title}-card`}
                                className={`animate-fade-up hover-lift-soft rounded-[26px] border border-[#eee8dc] bg-white p-6 shadow-[0_22px_60px_-48px_rgba(47,80,63,0.42)] ${
                                    index === 0
                                        ? 'stagger-1'
                                        : index === 1
                                          ? 'stagger-2'
                                          : 'stagger-3'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <img
                                        src={feature.icon}
                                        alt=""
                                        className="h-14 w-14 flex-none object-contain"
                                    />
                                    <div>
                                        <h3 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[#313d39]">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-4 text-[1.05rem] leading-8 text-[#4e5f59]">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </main>
            </div>
        </>
    );
}
