import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function LoginRedirect({ redirectTo, roleName, dashboardLabel }) {
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            router.visit(redirectTo, {
                replace: true,
            });
        }, 1400);

        return () => window.clearTimeout(timeoutId);
    }, [redirectTo]);

    return (
        <>
            <Head title="Preparando acceso" />

            <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f4efdf_0%,#edf4ea_48%,#f8f9f5_100%)] text-[#27423a]">
                <div className="animate-drift-soft absolute left-[-5rem] top-[-4rem] h-52 w-52 rounded-full bg-[#ffd773]/40 blur-3xl" />
                <div className="animate-drift-soft absolute bottom-[-6rem] right-[-3rem] h-64 w-64 rounded-full bg-[#80b57e]/28 blur-3xl [animation-delay:1.6s]" />

                <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
                    <div className="animate-scale-in-soft w-full max-w-[520px] rounded-[2.2rem] border border-white/80 bg-white/82 p-8 text-center shadow-[0_36px_90px_-54px_rgba(30,55,44,0.46)] backdrop-blur sm:p-10">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7ee_100%)] shadow-[0_22px_44px_-32px_rgba(33,62,49,0.46)]">
                            <img
                                src="/assets/landing/logo_flety.png"
                                alt="Flety"
                                className="animate-float-soft h-12 w-auto"
                            />
                        </div>

                        <div className="mt-8 space-y-3">
                            <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.32em] text-[#5e835f]">
                                Acceso autorizado
                            </p>
                            <h1 className="animate-fade-up stagger-1 text-[2.2rem] font-semibold tracking-[-0.05em] text-[#203029] sm:text-[2.6rem]">
                                Preparando tu panel
                            </h1>
                            <p className="animate-fade-up stagger-2 text-[1.02rem] leading-7 text-[#63706a]">
                                Estamos cargando la vista correspondiente para{' '}
                                <span className="font-semibold text-[#2f6d3e]">
                                    {roleName}
                                </span>
                                .
                            </p>
                        </div>

                        <div className="animate-fade-up stagger-3 mt-8 rounded-[1.7rem] border border-[#e6ebdf] bg-[linear-gradient(180deg,#f9fbf7_0%,#f0f4ea_100%)] p-5 text-left">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#74816f]">
                                Destino
                            </p>
                            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#234238]">
                                {dashboardLabel}
                            </p>

                            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#dde7d7]">
                                <div className="animate-glow-soft h-full w-[68%] rounded-full bg-[linear-gradient(90deg,#7aac72_0%,#4f9547_52%,#2f6d3e_100%)]" />
                            </div>
                        </div>

                        <div className="animate-fade-up stagger-4 mt-6 flex items-center justify-center gap-3 text-sm text-[#70807a]">
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#5d9a54]" />
                            Redirigiendo...
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
