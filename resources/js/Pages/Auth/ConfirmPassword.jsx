import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Confirma tu identidad"
            description="Estás entrando a un area protegida del sistema. Reingresa tu contrasena para continuar."
            eyebrow="Verificacion adicional"
            asideTitle="Las acciones sensibles deben validarse antes de ejecutarse"
            asideDescription="Este paso adicional protege tu cuenta cuando vas a modificar informacion personal o ejecutar operaciones delicadas."
            imageSrc="/assets/landing/hero_escena.png"
            imageAlt="Escena principal de Flety"
            footer={
                <Link
                    href={route('dashboard')}
                    className="font-semibold text-emerald-700 transition hover:text-emerald-600"
                >
                    Volver al panel
                </Link>
            }
        >
            <Head title="Confirmar contrasena" />

            <div className="mb-5 rounded-[26px] border border-slate-200 bg-slate-50/75 px-4 py-4 text-sm leading-7 text-slate-600">
                Esta zona requiere validacion adicional. Confirma tu
                contrasena antes de continuar.
            </div>

            <form onSubmit={submit} noValidate>
                <div>
                    <InputLabel htmlFor="password" value="Contrasena actual" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full"
                        isFocused={true}
                        placeholder="Ingresa tu contrasena"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6 flex items-center justify-end">
                    <PrimaryButton className="min-w-[180px]" disabled={processing}>
                        Confirmar acceso
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
