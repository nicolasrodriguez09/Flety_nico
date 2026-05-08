import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title="Define una nueva contrasena"
            description="Actualiza tu credencial de acceso para volver a entrar a la plataforma con seguridad."
            eyebrow="Restablecimiento"
            asideTitle="La seguridad del acceso tambien hace parte de la operacion"
            asideDescription="Usa una contrasena robusta para proteger tus rutas, solicitudes y actividad dentro del marketplace."
            imageSrc="/assets/landing/camion_hero.png"
            imageAlt="Camion de carga Flety"
            footer={
                <Link
                    href={route('login')}
                    className="font-semibold text-emerald-700 transition hover:text-emerald-600"
                >
                    Volver al inicio de sesion
                </Link>
            }
        >
            <Head title="Restablecer contrasena" />

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
                        placeholder="nombre@correo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Nueva contrasena" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        placeholder="Crea una contrasena segura"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar contrasena"
                    />

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-2 block w-full"
                        autoComplete="new-password"
                        placeholder="Repite tu nueva contrasena"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center justify-end pt-2">
                    <PrimaryButton className="min-w-[220px]" disabled={processing}>
                        Guardar nueva contrasena
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
