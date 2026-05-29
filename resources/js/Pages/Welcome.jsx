import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const Icons = {
    Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>,
    TrendingDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>,
    ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Truck: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="7" height="7" x="9" y="9" rx="1"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></svg>,
    Leaf: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
    CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
};

export default function Welcome({ auth, canLogin, canRegister }) {
    const user = auth?.user;
    const registerUrl = route('register');
    const transporterRegisterUrl = route('register', { role: 'transportista' });
    const producerRegisterUrl = route('register', { role: 'productor' });

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
            <Head title="Logística Agrícola Inteligente | Flety" />

            {/* Navbar Premium */}
            <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/assets/landing/logo_flety.png" alt="Flety Logo" className="h-9 w-auto" />
                    </div>

                    <nav className="flex items-center gap-4">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20"
                            >
                                Ir al Panel
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                                            scrolled 
                                                ? 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50' 
                                                : 'text-white hover:text-white hover:bg-white/10 backdrop-blur-sm'
                                        }`}
                                    >
                                        Iniciar sesión
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={registerUrl}
                                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:-translate-y-0.5"
                                    >
                                        Regístrate
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section - Imagen Protagonista */}
                <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 overflow-hidden flex items-center min-h-[90vh]">
                    {/* Imagen de Fondo a Pantalla Completa */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/assets/landing/fondo.png" 
                            alt="Flety Operación Logística" 
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Capa de oscurecimiento (Gradient overlay) para que el texto resalte brutalmente */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-900/40"></div>
                        <div className="absolute inset-0 bg-slate-900/30"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm font-bold text-white mb-8 shadow-2xl">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]"></span>
                                El marketplace logístico del campo
                            </div>

                            <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] text-white mb-6 drop-shadow-lg">
                                Transporta más, <br/>
                                <span className="text-emerald-400">gasta menos.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-slate-200 mb-10 font-medium leading-relaxed max-w-2xl drop-shadow-md">
                                Conecta rutas de retorno vacías con productores que necesitan mover su carga. Una plataforma robusta y transparente pensada 100% para el sector agrícola.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                {user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-slate-900 shadow-[0_0_40px_-10px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_60px_-15px_rgba(16,185,129,1)] hover:-translate-y-1"
                                    >
                                        Abrir Flety
                                        <Icons.ArrowRight />
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link
                                                href={registerUrl}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-slate-900 shadow-[0_0_40px_-10px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_60px_-15px_rgba(16,185,129,1)] hover:-translate-y-1"
                                            >
                                                Comenzar ahora
                                                <Icons.ArrowRight />
                                            </Link>
                                        )}
                                        <a
                                            href="#funcionalidades"
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 backdrop-blur-md px-8 py-4 text-lg font-bold text-white transition-all hover:border-white/60 hover:bg-white/10"
                                        >
                                            Ver cómo funciona
                                        </a>
                                    </>
                                )}
                            </div>

                            <div className="mt-12 flex items-center gap-8 text-sm font-semibold text-slate-300">
                                <span className="flex items-center gap-2"><Icons.CheckCircle /> Sin intermediarios</span>
                                <span className="flex items-center gap-2"><Icons.CheckCircle /> Precios transparentes</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section - Solid Cards */}
                <section id="funcionalidades" className="py-24 bg-white border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">La logística, hecha simple.</h2>
                            <p className="text-lg text-slate-600">Todo lo que necesitas para optimizar el transporte agrícola, centralizado en una plataforma rápida, confiable y orientada a resultados.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group">
                                <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Icons.Search />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Encuentra Viajes</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Localiza instantáneamente rutas de retorno con espacio disponible cerca de ti. Filtra por capacidad, tipo de vehículo y fechas.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group">
                                <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Icons.ShieldCheck />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Asegura Transporte</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Envía solicitudes directas a transportistas verificados. Monitorea el estado de tu carga desde la aceptación hasta la entrega.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group">
                                <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Icons.TrendingDown />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Ahorra y Aprovecha</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Productores consiguen fletes más económicos, y transportistas rentabilizan sus viajes vacíos. Un ecosistema donde todos ganan.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action Segmentado - Adiós al naranja, todo acorde al sistema */}
                <section className="py-24 bg-slate-50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div className="bg-emerald-900 rounded-[2.5rem] p-10 sm:p-16 relative overflow-hidden shadow-2xl">
                            {/* Decorative background pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                                </svg>
                            </div>

                            <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
                                <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">Únete al ecosistema Flety</h2>
                                <p className="text-lg text-emerald-100/80">Regístrate en la plataforma según tu rol y empieza a operar en minutos con datos reales del mercado agrícola.</p>
                            </div>

                            <div className="relative z-10 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                <Link 
                                    href={transporterRegisterUrl} 
                                    className="group bg-white p-8 rounded-2xl flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg border-2 border-transparent hover:border-emerald-400"
                                >
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                        <Icons.Truck />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Transportista</h3>
                                    <p className="text-slate-600 mb-6 flex-1">Publica tus rutas de retorno y monetiza el espacio libre en tus camiones.</p>
                                    <span className="w-full py-3 px-4 bg-slate-50 text-emerald-700 font-bold rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        Crear cuenta de transporte
                                    </span>
                                </Link>

                                <Link 
                                    href={producerRegisterUrl} 
                                    className="group bg-white p-8 rounded-2xl flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg border-2 border-transparent hover:border-emerald-400"
                                >
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                                        <Icons.Leaf />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Productor</h3>
                                    <p className="text-slate-600 mb-6 flex-1">Encuentra transporte seguro y a buen precio para sacar tus cosechas a tiempo.</p>
                                    <span className="w-full py-3 px-4 bg-slate-50 text-emerald-700 font-bold rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        Crear cuenta de productor
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Minimal Footer */}
                <footer className="bg-white border-t border-slate-200 py-10">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/assets/landing/logo_flety.png" alt="Flety" className="h-6 w-auto grayscale opacity-50" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                            © {new Date().getFullYear()} Flety. Plataforma Logística Agrícola.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
