import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

function FileInput({ id, label, error, onChange, required = false }) {
    return (
        <div>
            <InputLabel htmlFor={id} value={label} />
            <input
                id={id}
                type="file"
                accept="image/*"
                required={required}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-emerald-500 focus:ring-emerald-500"
            />
            <InputError message={error} className="mt-2" />
        </div>
    );
}

export default function Register({ roles, selectedRole }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        role: selectedRole ?? '',
        identity_document: '',
        driver_license: '',
        identity_document_image: null,
        driver_license_image: null,
        plate: '',
        vehicle_type: '',
        brand: '',
        model: '',
        model_year: '',
        color: '',
        capacity_kg: '',
        vehicle_photo: null,
        transit_license_image: null,
        insurance_expires_at: '',
        insurance_image: null,
        technical_review_expires_at: '',
        technical_review_image: null,
        farm_name: '',
        farm_location: '',
        production_type: '',
        password: '',
        password_confirmation: '',
    });

    const isTransporter = data.role === 'transportista';
    const isProducer = data.role === 'productor';

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            forceFormData: true,
            onFinish: () =>
                reset(
                    'password',
                    'password_confirmation',
                ),
        });
    };

    return (
        <GuestLayout
            title="Crea tu cuenta y entra al flujo de Flety"
            description="Registra tu perfil como transportista o productor para empezar a publicar rutas o solicitar capacidad de carga."
            eyebrow="Registro"
            asideTitle="Un acceso bien creado simplifica toda la operacion posterior"
            asideDescription="Desde aqui definimos el rol que determina la experiencia dentro del sistema y las acciones permitidas."
            imageSrc="/assets/landing/transportador.png"
            imageAlt="Transportador de Flety"
            footer={
                <span>
                    ¿Ya tienes una cuenta?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-emerald-700 transition hover:text-emerald-600"
                    >
                        Inicia sesion aqui
                    </Link>
                </span>
            }
        >
            <Head title="Crear cuenta" />

            <form onSubmit={submit} className="space-y-5" noValidate>
                <div>
                    <InputLabel htmlFor="name" value="Nombre completo" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-2 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        placeholder="Escribe tu nombre completo"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
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
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="phone" value="Telefono" />

                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-2 block w-full"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="3001234567"
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                    />

                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="role" value="Tipo de cuenta" />

                    <select
                        id="role"
                        name="role"
                        value={data.role}
                        className="mt-2 block w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 shadow-sm transition focus:border-emerald-500 focus:bg-white focus:ring-emerald-500"
                        onChange={(e) => setData('role', e.target.value)}
                        required
                    >
                        <option value="">Selecciona un rol</option>
                        {roles.map((role) => (
                            <option key={role.slug} value={role.slug}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    <InputError message={errors.role} className="mt-2" />
                </div>

                {isTransporter ? (
                    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                                Perfil de transportista
                            </p>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Datos y documentos de validacion
                            </h3>
                            <p className="text-sm leading-6 text-slate-600">
                                Administracion revisa tu documento, licencia y
                                soportes del primer vehiculo antes de habilitar
                                la publicacion de rutas.
                            </p>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="identity_document"
                                        value="Documento de identidad"
                                    />

                                    <TextInput
                                        id="identity_document"
                                        name="identity_document"
                                        value={data.identity_document}
                                        className="mt-2 block w-full"
                                        autoComplete="off"
                                        placeholder="Numero de cedula"
                                        onChange={(e) =>
                                            setData(
                                                'identity_document',
                                                e.target.value,
                                            )
                                        }
                                        required={isTransporter}
                                    />

                                    <InputError
                                        message={errors.identity_document}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="driver_license"
                                        value="Licencia de conduccion"
                                    />

                                    <TextInput
                                        id="driver_license"
                                        name="driver_license"
                                        value={data.driver_license}
                                        className="mt-2 block w-full"
                                        autoComplete="off"
                                        placeholder="Numero de licencia"
                                        onChange={(e) =>
                                            setData(
                                                'driver_license',
                                                e.target.value,
                                            )
                                        }
                                        required={isTransporter}
                                    />

                                    <InputError
                                        message={errors.driver_license}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <FileInput
                                id="identity_document_image"
                                label="Imagen del documento de identidad"
                                required={isTransporter}
                                error={errors.identity_document_image}
                                onChange={(file) =>
                                    setData('identity_document_image', file)
                                }
                            />

                            <FileInput
                                id="driver_license_image"
                                label="Imagen de la licencia de conduccion"
                                required={isTransporter}
                                error={errors.driver_license_image}
                                onChange={(file) =>
                                    setData('driver_license_image', file)
                                }
                            />

                            <div>
                                <InputLabel htmlFor="plate" value="Placa" />

                                <TextInput
                                    id="plate"
                                    name="plate"
                                    value={data.plate}
                                    className="mt-2 block w-full"
                                    autoComplete="off"
                                    placeholder="ABC123"
                                    onChange={(e) =>
                                        setData('plate', e.target.value)
                                    }
                                    required={isTransporter}
                                />

                                <InputError
                                    message={errors.plate}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="vehicle_type"
                                    value="Tipo de vehiculo"
                                />

                                <TextInput
                                    id="vehicle_type"
                                    name="vehicle_type"
                                    value={data.vehicle_type}
                                    className="mt-2 block w-full"
                                    autoComplete="off"
                                    placeholder="Camion, camioneta, furgon"
                                    onChange={(e) =>
                                        setData(
                                            'vehicle_type',
                                            e.target.value,
                                        )
                                    }
                                    required={isTransporter}
                                />

                                <InputError
                                    message={errors.vehicle_type}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="capacity_kg"
                                    value="Capacidad en kg"
                                />

                                <TextInput
                                    id="capacity_kg"
                                    name="capacity_kg"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={data.capacity_kg}
                                    className="mt-2 block w-full"
                                    inputMode="decimal"
                                    placeholder="1500"
                                    onChange={(e) =>
                                        setData(
                                            'capacity_kg',
                                            e.target.value,
                                        )
                                    }
                                    required={isTransporter}
                                />

                                <InputError
                                    message={errors.capacity_kg}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="brand" value="Marca" />

                                    <TextInput
                                        id="brand"
                                        name="brand"
                                        value={data.brand}
                                        className="mt-2 block w-full"
                                        autoComplete="off"
                                        placeholder="Chevrolet, Hino, JAC"
                                        onChange={(e) =>
                                            setData('brand', e.target.value)
                                        }
                                        required={isTransporter}
                                    />

                                    <InputError
                                        message={errors.brand}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="model"
                                        value="Linea o modelo"
                                    />

                                    <TextInput
                                        id="model"
                                        name="model"
                                        value={data.model}
                                        className="mt-2 block w-full"
                                        autoComplete="off"
                                        placeholder="NPR, Dutro, NKR"
                                        onChange={(e) =>
                                            setData('model', e.target.value)
                                        }
                                        required={isTransporter}
                                    />

                                    <InputError
                                        message={errors.model}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="model_year"
                                        value="Anio del vehiculo"
                                    />

                                    <TextInput
                                        id="model_year"
                                        name="model_year"
                                        type="number"
                                        min="1950"
                                        value={data.model_year}
                                        className="mt-2 block w-full"
                                        inputMode="numeric"
                                        placeholder="2020"
                                        onChange={(e) =>
                                            setData(
                                                'model_year',
                                                e.target.value,
                                            )
                                        }
                                        required={isTransporter}
                                    />

                                    <InputError
                                        message={errors.model_year}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="color" value="Color" />

                                    <TextInput
                                        id="color"
                                        name="color"
                                        value={data.color}
                                        className="mt-2 block w-full"
                                        autoComplete="off"
                                        placeholder="Blanco"
                                        onChange={(e) =>
                                            setData('color', e.target.value)
                                        }
                                    />

                                    <InputError
                                        message={errors.color}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <FileInput
                                id="vehicle_photo"
                                label="Foto del vehiculo"
                                required={isTransporter}
                                error={errors.vehicle_photo}
                                onChange={(file) =>
                                    setData('vehicle_photo', file)
                                }
                            />

                            <FileInput
                                id="transit_license_image"
                                label="Imagen de la licencia de transito"
                                required={isTransporter}
                                error={errors.transit_license_image}
                                onChange={(file) =>
                                    setData('transit_license_image', file)
                                }
                            />

                            <div>
                                <InputLabel
                                    htmlFor="insurance_expires_at"
                                    value="Seguro vigente hasta"
                                />

                                <TextInput
                                    id="insurance_expires_at"
                                    name="insurance_expires_at"
                                    type="date"
                                    value={data.insurance_expires_at}
                                    className="mt-2 block w-full"
                                    onChange={(e) =>
                                        setData(
                                            'insurance_expires_at',
                                            e.target.value,
                                        )
                                    }
                                    required={isTransporter}
                                />

                                <InputError
                                    message={errors.insurance_expires_at}
                                    className="mt-2"
                                />
                            </div>

                            <FileInput
                                id="insurance_image"
                                label="Soporte del seguro"
                                required={isTransporter}
                                error={errors.insurance_image}
                                onChange={(file) =>
                                    setData('insurance_image', file)
                                }
                            />

                            <div>
                                <InputLabel
                                    htmlFor="technical_review_expires_at"
                                    value="Tecnico-mecanica vigente hasta"
                                />

                                <TextInput
                                    id="technical_review_expires_at"
                                    name="technical_review_expires_at"
                                    type="date"
                                    value={data.technical_review_expires_at}
                                    className="mt-2 block w-full"
                                    onChange={(e) =>
                                        setData(
                                            'technical_review_expires_at',
                                            e.target.value,
                                        )
                                    }
                                    required={isTransporter}
                                />

                                <InputError
                                    message={errors.technical_review_expires_at}
                                    className="mt-2"
                                />
                            </div>

                            <FileInput
                                id="technical_review_image"
                                label="Soporte de tecnico-mecanica"
                                required={isTransporter}
                                error={errors.technical_review_image}
                                onChange={(file) =>
                                    setData('technical_review_image', file)
                                }
                            />
                        </div>
                    </section>
                ) : null}

                {isProducer ? (
                    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                                Perfil de productor
                            </p>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Informacion de la finca
                            </h3>
                            <p className="text-sm leading-6 text-slate-600">
                                Estos datos se usan para identificar tu origen
                                de carga y facilitar la coordinacion del
                                transporte.
                            </p>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="farm_name"
                                    value="Nombre de la finca"
                                />

                                <TextInput
                                    id="farm_name"
                                    name="farm_name"
                                    value={data.farm_name}
                                    className="mt-2 block w-full"
                                    autoComplete="organization"
                                    placeholder="Finca La Esperanza"
                                    onChange={(e) =>
                                        setData('farm_name', e.target.value)
                                    }
                                    required={isProducer}
                                />

                                <InputError
                                    message={errors.farm_name}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="farm_location"
                                    value="Ubicacion de la finca"
                                />

                                <TextInput
                                    id="farm_location"
                                    name="farm_location"
                                    value={data.farm_location}
                                    className="mt-2 block w-full"
                                    autoComplete="address-level2"
                                    placeholder="Boyaca, vereda Centro"
                                    onChange={(e) =>
                                        setData(
                                            'farm_location',
                                            e.target.value,
                                        )
                                    }
                                    required={isProducer}
                                />

                                <InputError
                                    message={errors.farm_location}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="production_type"
                                    value="Tipo de produccion"
                                />

                                <TextInput
                                    id="production_type"
                                    name="production_type"
                                    value={data.production_type}
                                    className="mt-2 block w-full"
                                    placeholder="Papa, cafe, hortalizas"
                                    onChange={(e) =>
                                        setData(
                                            'production_type',
                                            e.target.value,
                                        )
                                    }
                                />

                                <InputError
                                    message={errors.production_type}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </section>
                ) : null}

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contrasena" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full"
                        autoComplete="new-password"
                        placeholder="Minimo 8 caracteres"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar contrasena"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-2 block w-full"
                        autoComplete="new-password"
                        placeholder="Repite tu contrasena"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center justify-end pt-2">
                    <PrimaryButton className="min-w-[180px]" disabled={processing}>
                        Crear cuenta
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
