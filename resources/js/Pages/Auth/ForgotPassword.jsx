import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout
            title="Recupera el acceso a tu cuenta"
            description="Te enviaremos un enlace de restablecimiento al correo registrado para que puedas crear una nueva contrasena."
            eyebrow="Recuperacion"
            asideTitle="La operacion no deberia detenerse por una contrasena olvidada"
            asideDescription="Mantuvimos este flujo directo para que recuperes tu acceso sin perder tiempo en soporte manual."
            imageSrc="/assets/landing/hero_escena.png"
            imageAlt="Vista principal de la plataforma Flety"
            footer={
                <Link
                    href={route('login')}
                    className="font-semibold text-emerald-700 transition hover:text-emerald-600"
                >
                    Volver al inicio de sesion
                </Link>
            }
        >
            <Head title="Recuperar contrasena" />

            {status && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5" noValidate>
                <div>
                    <InputLabel htmlFor="email" value="Correo electronico" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full"
                        isFocused={true}
                        placeholder="nombre@correo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </div>

                <InputError message={errors.email} className="mt-2" />

                <div className="flex items-center justify-end pt-2">
                    <PrimaryButton className="min-w-[220px]" disabled={processing}>
                        Enviar enlace de recuperacion
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
