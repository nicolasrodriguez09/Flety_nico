import { Link } from '@inertiajs/react';

const highlights = [
    'Roles separados para productor, transportista y administrador.',
    'Flujo de rutas y solicitudes pensado para operacion rural.',
    'Base visual alineada con la experiencia principal de Flety.',
];

export default function GuestLayout({
    children,
    title,
    description,
    eyebrow = 'Acceso Flety',
    asideTitle = 'Marketplace logistico para transporte agricola',
    asideDescription = 'Conecta viajes de retorno con productores que necesitan mover carga de forma simple, clara y confiable.',
    imageSrc = '/assets/landing/hero_escena.png',
    imageAlt = 'Ilustracion principal de Flety',
    footer = null,
}) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6f1e3_0%,#edf5ea_46%,#f7f8f3_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="animate-drift-soft absolute left-[-6rem] top-[-5rem] h-56 w-56 rounded-full bg-[#ffd16b]/45 blur-3xl" />
            <div className="animate-drift-soft absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-[#85b67f]/30 blur-3xl [animation-delay:1.8s]" />

            <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1240px] items-stretch">
                <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="animate-fade-right relative overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(180deg,rgba(35,69,60,0.98)_0%,rgba(43,82,71,0.94)_54%,rgba(68,112,76,0.92)_100%)] p-6 text-white shadow-[0_28px_80px_-44px_rgba(25,53,43,0.7)] sm:p-8 lg:p-10">
                        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(255,255,255,0)_70%)]" />

                        <div className="relative flex h-full flex-col justify-between gap-10">
                            <div className="space-y-8">
                                <div className="animate-fade-up flex items-center justify-between gap-4">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur"
                                    >
                                        <img
                                            src="/assets/landing/logo_flety.png"
                                            alt="Flety"
                                            className="h-10 w-auto"
                                        />
                                        <span className="text-sm font-semibold tracking-[0.24em] text-white/90">
                                            FLETY
                                        </span>
                                    </Link>

                                    <Link
                                        href="/"
                                        className="text-sm font-medium text-white/80 transition hover:text-white"
                                    >
                                        Volver al inicio
                                    </Link>
                                </div>

                                <div className="animate-fade-up stagger-1 max-w-xl space-y-4">
                                    <p className="inline-flex rounded-full border border-[#ffe8a3]/20 bg-[#ffe8a3]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#fff0bd]">
                                        Plataforma PWA
                                    </p>
                                    <h1 className="text-4xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-[3.3rem]">
                                        {asideTitle}
                                    </h1>
                                    <p className="max-w-lg text-base leading-7 text-white/78 sm:text-[1.05rem]">
                                        {asideDescription}
                                    </p>
                                </div>
                            </div>

                            <div className="animate-scale-in-soft stagger-2 relative overflow-hidden rounded-[28px] border border-white/12 bg-white/8 p-4 backdrop-blur sm:p-5">
                                <img
                                    src={imageSrc}
                                    alt={imageAlt}
                                    className="animate-float-soft w-full rounded-[22px] object-cover shadow-[0_24px_60px_-42px_rgba(0,0,0,0.7)]"
                                />
                                <div className="mt-5 grid gap-3">
                                    {highlights.map((highlight, index) => (
                                        <div
                                            key={highlight}
                                            className={`animate-fade-up hover-lift-soft rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/82 ${
                                                index === 0
                                                    ? 'stagger-1'
                                                    : index === 1
                                                      ? 'stagger-2'
                                                      : 'stagger-3'
                                            }`}
                                        >
                                            {highlight}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex items-center justify-center">
                        <div className="animate-fade-left w-full max-w-[560px] rounded-[34px] border border-white/75 bg-white/88 p-6 shadow-[0_28px_80px_-48px_rgba(30,55,44,0.45)] backdrop-blur sm:p-8">
                            <div className="mb-8">
                                <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
                                    {eyebrow}
                                </p>
                                <h2 className="animate-fade-up stagger-1 mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-[2.4rem]">
                                    {title}
                                </h2>
                                {description ? (
                                    <p className="animate-fade-up stagger-2 mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-[1rem]">
                                        {description}
                                    </p>
                                ) : null}
                            </div>

                            <div className="animate-fade-up stagger-3">{children}</div>

                            {footer ? (
                                <div className="animate-fade-up stagger-4 mt-8 border-t border-slate-200 pt-5 text-sm text-slate-600">
                                    {footer}
                                </div>
                            ) : null}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
