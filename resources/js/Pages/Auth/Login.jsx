import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Inicia sesion en tu centro operativo"
            description="Accede a tu cuenta para gestionar rutas, solicitar transporte o supervisar la operacion segun tu rol dentro de Flety."
            eyebrow="Ingreso seguro"
            asideTitle="Cada viaje de retorno puede convertirse en una oportunidad logistica"
            asideDescription="Flety conecta a quienes tienen capacidad disponible con quienes necesitan transportar carga sin friccion innecesaria."
            imageSrc="/assets/landing/granjero.png"
            imageAlt="Granjero usando la plataforma Flety"
            footer={
                <span>
                    ¿Aun no tienes cuenta?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-emerald-700 transition hover:text-emerald-600"
                    >
                        Crea tu acceso en Flety
                    </Link>
                </span>
            }
        >
            <Head title="Iniciar sesion" />

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
                        autoComplete="username"
                        isFocused={true}
                        placeholder="nombre@correo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Contrasena" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full"
                        autoComplete="current-password"
                        placeholder="Ingresa tu contrasena"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-3 text-sm text-slate-600">
                            Mantener sesion iniciada
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-emerald-700 transition hover:text-emerald-600"
                        >
                            Recuperar contrasena
                        </Link>
                    )}
                </div>

                <div className="flex items-center justify-end pt-2">
                    <PrimaryButton className="min-w-[180px]" disabled={processing}>
                        Ingresar a Flety
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
