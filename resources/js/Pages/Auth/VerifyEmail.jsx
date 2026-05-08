import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout
            title="Confirma tu correo electronico"
            description="Antes de continuar, necesitamos verificar que el correo registrado te pertenece para activar el acceso completo al sistema."
            eyebrow="Verificacion"
            asideTitle="La confianza en Flety empieza validando cada acceso"
            asideDescription="Este paso evita cuentas mal configuradas y ayuda a sostener una operacion mas segura para transportistas, productores y administradores."
            imageSrc="/assets/landing/productor_hero.png"
            imageAlt="Productor usando la plataforma Flety"
        >
            <Head title="Verificar correo" />

            <div className="mb-5 rounded-[26px] border border-slate-200 bg-slate-50/75 px-4 py-4 text-sm leading-7 text-slate-600">
                Te enviamos un enlace a tu correo. Haz clic en ese enlace para
                verificar tu cuenta. Si no lo recibiste, puedes solicitar uno
                nuevo desde aqui.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    Enviamos un nuevo enlace de verificacion al correo
                    registrado.
                </div>
            )}

            <form onSubmit={submit} noValidate>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <PrimaryButton
                        disabled={processing}
                        className="min-w-[220px]"
                    >
                        Reenviar verificacion
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
                    >
                        Cerrar sesion
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
