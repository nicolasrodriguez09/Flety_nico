import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const statusLabels = {
    available: 'Aprobado',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    unavailable: 'No disponible',
};

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

function StatusBadge({ status }) {
    const styles = {
        available: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        rejected: 'bg-rose-100 text-rose-700',
        unavailable: 'bg-slate-200 text-slate-700',
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}
        >
            {statusLabels[status] ?? status}
        </span>
    );
}

function panelClassName(extra = '') {
    return `animate-panel-rise rounded-2xl border border-[#dfe8dc] bg-white p-4 shadow-[0_18px_42px_-34px_rgba(31,74,49,0.35)] sm:p-6 ${extra}`.trim();
}

function FileField({ id, label, error, onChange, required = false }) {
    return (
        <div>
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
                {label}
            </label>
            <input
                id={id}
                type="file"
                accept="image/*"
                required={required}
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#427c46] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-emerald-500 focus:ring-emerald-500"
            />
            <FieldError message={error} />
        </div>
    );
}

function VehicleForm() {
    const form = useForm({
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
    });

    return (
        <article className={panelClassName()}>
            <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                    Vehiculo
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                    Registrar vehiculo
                </h3>
                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                    Completa los datos del vehiculo y adjunta los soportes. Al
                    guardar, queda pendiente de revision administrativa.
                </p>
            </div>

            <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    form.post(route('transporter.vehicles.store'), {
                        forceFormData: true,
                        preserveScroll: true,
                        onSuccess: () => form.reset(),
                    });
                }}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="plate"
                            className="text-sm font-medium text-slate-700"
                        >
                            Placa
                        </label>
                        <input
                            id="plate"
                            required
                            value={form.data.plate}
                            onChange={(event) =>
                                form.setData('plate', event.target.value)
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="ABC123"
                        />
                        <FieldError message={form.errors.plate} />
                    </div>

                    <div>
                        <label
                            htmlFor="vehicle_type"
                            className="text-sm font-medium text-slate-700"
                        >
                            Tipo de vehiculo
                        </label>
                        <input
                            id="vehicle_type"
                            required
                            value={form.data.vehicle_type}
                            onChange={(event) =>
                                form.setData('vehicle_type', event.target.value)
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Camion, camioneta, furgon"
                        />
                        <FieldError message={form.errors.vehicle_type} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="brand"
                            className="text-sm font-medium text-slate-700"
                        >
                            Marca
                        </label>
                        <input
                            id="brand"
                            required
                            value={form.data.brand}
                            onChange={(event) =>
                                form.setData('brand', event.target.value)
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Chevrolet, Hino, JAC"
                        />
                        <FieldError message={form.errors.brand} />
                    </div>

                    <div>
                        <label
                            htmlFor="model"
                            className="text-sm font-medium text-slate-700"
                        >
                            Linea o modelo
                        </label>
                        <input
                            id="model"
                            required
                            value={form.data.model}
                            onChange={(event) =>
                                form.setData('model', event.target.value)
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="NPR, Dutro, NKR"
                        />
                        <FieldError message={form.errors.model} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label
                            htmlFor="model_year"
                            className="text-sm font-medium text-slate-700"
                        >
                            Anio
                        </label>
                        <input
                            id="model_year"
                            type="number"
                            required
                            min="1950"
                            value={form.data.model_year}
                            onChange={(event) =>
                                form.setData('model_year', event.target.value)
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="2020"
                        />
                        <FieldError message={form.errors.model_year} />
                    </div>

                    <div>
                        <label
                            htmlFor="color"
                            className="text-sm font-medium text-slate-700"
                        >
                            Color
                        </label>
                        <input
                            id="color"
                            value={form.data.color}
                            onChange={(event) =>
                                form.setData('color', event.target.value)
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Blanco"
                        />
                        <FieldError message={form.errors.color} />
                    </div>

                    <div>
                        <label
                            htmlFor="capacity_kg"
                            className="text-sm font-medium text-slate-700"
                        >
                            Capacidad en kg
                        </label>
                        <input
                            id="capacity_kg"
                            type="number"
                            required
                            min="1"
                            step="0.01"
                            value={form.data.capacity_kg}
                            onChange={(event) =>
                                form.setData('capacity_kg', event.target.value)
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="1500"
                        />
                        <FieldError message={form.errors.capacity_kg} />
                    </div>
                </div>

                <FileField
                    id="vehicle_photo"
                    label="Foto del vehiculo"
                    required
                    error={form.errors.vehicle_photo}
                    onChange={(file) => form.setData('vehicle_photo', file)}
                />

                <FileField
                    id="transit_license_image"
                    label="Imagen de la licencia de transito"
                    required
                    error={form.errors.transit_license_image}
                    onChange={(file) =>
                        form.setData('transit_license_image', file)
                    }
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="insurance_expires_at"
                            className="text-sm font-medium text-slate-700"
                        >
                            Seguro vigente hasta
                        </label>
                        <input
                            id="insurance_expires_at"
                            type="date"
                            required
                            value={form.data.insurance_expires_at}
                            onChange={(event) =>
                                form.setData(
                                    'insurance_expires_at',
                                    event.target.value,
                                )
                            }
                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                        <FieldError message={form.errors.insurance_expires_at} />
                    </div>

                    <FileField
                        id="insurance_image"
                        label="Soporte del seguro"
                        required
                        error={form.errors.insurance_image}
                        onChange={(file) => form.setData('insurance_image', file)}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="technical_review_expires_at"
                            className="text-sm font-medium text-slate-700"
                        >
                            Tecnico-mecanica vigente hasta
                        </label>
                        <input
                            id="technical_review_expires_at"
                            type="date"
                            required
                            value={form.data.technical_review_expires_at}
                            onChange={(event) =>
                                form.setData(
                                    'technical_review_expires_at',
                                    event.target.value,
                                )
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                        <FieldError
                            message={form.errors.technical_review_expires_at}
                        />
                    </div>

                    <FileField
                        id="technical_review_image"
                        label="Soporte de tecnico-mecanica"
                        required
                        error={form.errors.technical_review_image}
                        onChange={(file) =>
                            form.setData('technical_review_image', file)
                        }
                    />
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Al guardar, el vehiculo queda pendiente de revision.
                    Administracion debe aprobarlo antes de que puedas publicar
                    rutas.
                </div>

                <button
                    type="submit"
                    disabled={form.processing}
                    className="interactive-lift inline-flex w-full justify-center rounded-xl bg-[#427c46] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#356b3f] disabled:opacity-60 sm:w-auto"
                >
                    {form.processing ? 'Guardando...' : 'Guardar vehiculo'}
                </button>
            </form>
        </article>
    );
}

function VehicleList({ vehicles }) {
    return (
        <article className={panelClassName()}>
            <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                    Flota
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                    Vehiculos registrados
                </h3>
            </div>

            <div className="mt-6 space-y-3">
                {vehicles.length ? (
                    vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {vehicle.plate} · {vehicle.vehicle_type}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {vehicle.brand} {vehicle.model}{' '}
                                        {vehicle.model_year} ·{' '}
                                        {vehicle.capacity_kg} kg
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Seguro hasta{' '}
                                        {vehicle.insurance_expires_at ??
                                            'sin fecha'}{' '}
                                        · Tecno hasta{' '}
                                        {vehicle.technical_review_expires_at ??
                                            'sin fecha'}
                                    </p>
                                    {vehicle.review_notes ? (
                                        <p className="mt-2 text-sm text-rose-600">
                                            {vehicle.review_notes}
                                        </p>
                                    ) : null}
                                </div>
                                <StatusBadge status={vehicle.status} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm text-slate-500">
                        Aun no tienes vehiculos registrados.
                    </div>
                )}
            </div>
        </article>
    );
}

export default function CreateVehicle({ vehicles = [] }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#427c46]">
                            Vehiculos
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-900">
                            Registro y revision de flota
                        </h2>
                    </div>
                    <Link
                        href={route('transporter.routes.index')}
                        className="interactive-lift inline-flex w-full justify-center rounded-xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white sm:w-auto"
                    >
                        Volver a rutas
                    </Link>
                </div>
            }
        >
            <Head title="Registrar vehiculo" />

            <div className="bg-[linear-gradient(180deg,#eef7ec_0%,#f7faf4_100%)] py-5 sm:py-7">
                <div className="mx-auto flex max-w-[1540px] flex-col gap-5 px-3 sm:px-5 lg:px-8">
                    {flash.success ? (
                        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                            {flash.success}
                        </section>
                    ) : null}
                    {flash.error ? (
                        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
                            {flash.error}
                        </section>
                    ) : null}

                    <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                        <VehicleForm />
                        <VehicleList vehicles={vehicles} />
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
