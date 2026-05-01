import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

const statusLabels = {
    accepted: 'Aceptada',
    approved: 'Aprobado',
    available: 'Aprobado',
    cancelled: 'Cancelada',
    closed: 'Cerrada',
    confirmed: 'Confirmado',
    pending: 'Pendiente',
    published: 'Publicada',
    rejected: 'Rechazada',
};

function formatDate(value) {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === '') {
        return 'Sin definir';
    }

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function cardClassName(extra = '') {
    return `rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-sm ${extra}`.trim();
}

function StatusBadge({ status }) {
    const styles = {
        accepted: 'bg-emerald-100 text-emerald-700',
        approved: 'bg-emerald-100 text-emerald-700',
        available: 'bg-emerald-100 text-emerald-700',
        confirmed: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        published: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-rose-100 text-rose-700',
        cancelled: 'bg-rose-100 text-rose-700',
        closed: 'bg-slate-200 text-slate-700',
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}
        >
            {statusLabels[status] ?? status}
        </span>
    );
}

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

function SectionTitle({ eyebrow, title, description }) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                {eyebrow}
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
            {description ? (
                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-sm text-slate-500">
            {message}
        </div>
    );
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
                className="mt-2 block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-emerald-500 focus:ring-emerald-500"
            />
            <FieldError message={error} />
        </div>
    );
}

function FlashMessages({ success, error }) {
    return (
        <>
            {success ? (
                <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                    {success}
                </section>
            ) : null}
            {error ? (
                <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
                    {error}
                </section>
            ) : null}
        </>
    );
}

function ContactActions({ service }) {
    const counterpart = service.counterpart;

    if (!counterpart?.phone_url && !counterpart?.whatsapp_url) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap gap-3">
            {counterpart.whatsapp_url ? (
                <a
                    href={counterpart.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                    Contactar por WhatsApp
                </a>
            ) : null}
            {counterpart.phone_url ? (
                <a
                    href={counterpart.phone_url}
                    className="inline-flex rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                >
                    Llamar ahora
                </a>
            ) : null}
        </div>
    );
}

function ServiceCard({ service }) {
    return (
        <article className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold text-slate-900">
                            {service.route?.origin} {'->'} {service.route?.destination}
                        </h4>
                        <StatusBadge status={service.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                        Confirmado el {formatDate(service.confirmed_at)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Producto: {service.request?.product_type} · Peso:{' '}
                        {service.request?.cargo_weight_kg} kg
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Entrega: {service.request?.delivery_destination}
                    </p>
                    {service.request?.estimated_cost ? (
                        <p className="mt-1 text-sm text-slate-600">
                            Valor estimado:{' '}
                            {formatCurrency(service.request.estimated_cost)}
                        </p>
                    ) : null}
                    {service.route?.vehicle ? (
                        <p className="mt-1 text-sm text-slate-600">
                            Vehiculo: {service.route.vehicle.vehicle_type} ·{' '}
                            {service.route.vehicle.plate}
                        </p>
                    ) : null}
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-white px-4 py-4 text-sm text-slate-600 lg:max-w-xs">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        Contacto habilitado
                    </p>
                    <p className="mt-3 font-semibold text-slate-900">
                        {service.counterpart?.name}
                    </p>
                    <p className="mt-1">
                        {service.counterpart?.role === 'transportista'
                            ? 'Transportista asignado'
                            : 'Productor asignado'}
                    </p>
                    <p className="mt-3 text-base font-semibold text-slate-900">
                        {service.counterpart?.phone}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Visible solo para las partes involucradas en este
                        servicio confirmado.
                    </p>
                    <ContactActions service={service} />
                </div>
            </div>
        </article>
    );
}

function PublishRouteForm({ vehicles, transporterProfile }) {
    const approvedVehicles = vehicles.filter(
        (vehicle) => vehicle.status === 'available',
    );
    const routeForm = useForm({
        vehicle_id: approvedVehicles[0]?.id ?? '',
        origin: '',
        destination: '',
        departure_at: '',
        available_capacity_kg: '',
        permitted_cargo_type: '',
    });

    const selectedVehicle = vehicles.find(
        (vehicle) => String(vehicle.id) === String(routeForm.data.vehicle_id),
    );
    const canCreateRoutes = transporterProfile?.validation_status === 'approved';
    const canSubmitRoute =
        canCreateRoutes &&
        approvedVehicles.length > 0 &&
        routeForm.data.vehicle_id &&
        routeForm.data.origin.trim() &&
        routeForm.data.destination.trim() &&
        routeForm.data.departure_at &&
        Number(routeForm.data.available_capacity_kg) > 0 &&
        (!selectedVehicle ||
            Number(routeForm.data.available_capacity_kg) <=
                Number(selectedVehicle.capacity_kg)) &&
        routeForm.data.permitted_cargo_type.trim();

    return (
        <article className={cardClassName()}>
            <SectionTitle
                eyebrow="Rutas"
                title="Publicar ruta de retorno"
                description="Registra origen, destino, fecha y capacidad disponible para ofrecer espacio de carga a productores."
            />

            {!canCreateRoutes ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Tu perfil aun no esta aprobado. Puedes registrar vehiculos,
                    pero no publicar rutas.
                </div>
            ) : null}

            {!approvedVehicles.length ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Necesitas al menos un vehiculo aprobado por administracion
                    para publicar rutas.
                </div>
            ) : null}

            <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    routeForm.post(route('transporter.routes.store'), {
                        preserveScroll: true,
                        onSuccess: () =>
                            routeForm.reset(
                                'origin',
                                'destination',
                                'departure_at',
                                'available_capacity_kg',
                                'permitted_cargo_type',
                            ),
                    });
                }}
            >
                <div>
                    <label
                        htmlFor="vehicle_id"
                        className="text-sm font-medium text-slate-700"
                    >
                        Vehiculo
                    </label>
                    <select
                        id="vehicle_id"
                        required
                        value={routeForm.data.vehicle_id}
                        onChange={(event) =>
                            routeForm.setData('vehicle_id', event.target.value)
                        }
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    >
                        <option value="">Selecciona un vehiculo</option>
                        {approvedVehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.plate} - {vehicle.vehicle_type} -{' '}
                                {vehicle.capacity_kg} kg
                            </option>
                        ))}
                    </select>
                    {selectedVehicle ? (
                        <p className="mt-2 text-xs text-slate-500">
                            Capacidad maxima del vehiculo:{' '}
                            {selectedVehicle.capacity_kg} kg
                        </p>
                    ) : null}
                    <FieldError message={routeForm.errors.vehicle_id} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="origin"
                            className="text-sm font-medium text-slate-700"
                        >
                            Origen
                        </label>
                        <input
                            id="origin"
                            required
                            autoComplete="address-level2"
                            value={routeForm.data.origin}
                            onChange={(event) =>
                                routeForm.setData('origin', event.target.value)
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Ej. Neiva"
                        />
                        <FieldError message={routeForm.errors.origin} />
                    </div>

                    <div>
                        <label
                            htmlFor="destination"
                            className="text-sm font-medium text-slate-700"
                        >
                            Destino
                        </label>
                        <input
                            id="destination"
                            required
                            autoComplete="address-level2"
                            value={routeForm.data.destination}
                            onChange={(event) =>
                                routeForm.setData(
                                    'destination',
                                    event.target.value,
                                )
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Ej. Ibague"
                        />
                        <FieldError message={routeForm.errors.destination} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="departure_at"
                            className="text-sm font-medium text-slate-700"
                        >
                            Fecha y hora de salida
                        </label>
                        <input
                            id="departure_at"
                            type="datetime-local"
                            required
                            value={routeForm.data.departure_at}
                            onChange={(event) =>
                                routeForm.setData(
                                    'departure_at',
                                    event.target.value,
                                )
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                        <FieldError message={routeForm.errors.departure_at} />
                    </div>

                    <div>
                        <label
                            htmlFor="available_capacity_kg"
                            className="text-sm font-medium text-slate-700"
                        >
                            Capacidad disponible
                        </label>
                        <input
                            id="available_capacity_kg"
                            type="number"
                            required
                            inputMode="decimal"
                            min="1"
                            max={selectedVehicle?.capacity_kg}
                            step="0.01"
                            value={routeForm.data.available_capacity_kg}
                            onChange={(event) =>
                                routeForm.setData(
                                    'available_capacity_kg',
                                    event.target.value,
                                )
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Ej. 1500"
                        />
                        <FieldError
                            message={routeForm.errors.available_capacity_kg}
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="permitted_cargo_type"
                        className="text-sm font-medium text-slate-700"
                    >
                        Tipo de carga permitida
                    </label>
                    <input
                        id="permitted_cargo_type"
                        required
                        value={routeForm.data.permitted_cargo_type}
                        onChange={(event) =>
                            routeForm.setData(
                                'permitted_cargo_type',
                                event.target.value,
                            )
                        }
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        placeholder="Ej. cafe, papa, insumos"
                    />
                    <FieldError message={routeForm.errors.permitted_cargo_type} />
                </div>

                <button
                    type="submit"
                    disabled={routeForm.processing || !canSubmitRoute}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {routeForm.processing ? 'Publicando...' : 'Publicar ruta'}
                </button>
            </form>
        </article>
    );
}

function TransporterView({
    transporterProfile,
    vehicles,
    myRoutes,
    incomingRequests,
    confirmedServices,
}) {
    const vehicleForm = useForm({
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

    const requestDecisionForm = useForm({});

    return (
        <>
            <section className={cardClassName()}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm text-slate-600">
                            Estado de validacion del transportista
                        </p>
                        <div className="mt-3">
                            <StatusBadge
                                status={transporterProfile?.validation_status}
                            />
                        </div>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-slate-600">
                        La plataforma protege tus rutas, solicitudes y contactos
                        para que cada servicio avance solo cuando ambas partes
                        esten confirmadas.
                    </p>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <article className={cardClassName()}>
                    <SectionTitle
                        eyebrow="Vehiculo"
                        title="Registrar vehiculo"
                        description="Cada ruta publicada queda asociada a un vehiculo del mismo transportista."
                    />

                    <form
                        className="mt-6 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            vehicleForm.post(
                                route('transporter.vehicles.store'),
                                {
                                    forceFormData: true,
                                    preserveScroll: true,
                                    onSuccess: () => vehicleForm.reset(),
                                },
                            );
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
                                    value={vehicleForm.data.plate}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'plate',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="ABC123"
                                />
                                <FieldError message={vehicleForm.errors.plate} />
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
                                    value={vehicleForm.data.vehicle_type}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'vehicle_type',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="Camion, camioneta, furgon"
                                />
                                <FieldError
                                    message={vehicleForm.errors.vehicle_type}
                                />
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
                                    value={vehicleForm.data.brand}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'brand',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="Chevrolet, Hino, JAC"
                                />
                                <FieldError message={vehicleForm.errors.brand} />
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
                                    value={vehicleForm.data.model}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'model',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="NPR, Dutro, NKR"
                                />
                                <FieldError message={vehicleForm.errors.model} />
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
                                    value={vehicleForm.data.model_year}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'model_year',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="2020"
                                />
                                <FieldError
                                    message={vehicleForm.errors.model_year}
                                />
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
                                    value={vehicleForm.data.color}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'color',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="Blanco"
                                />
                                <FieldError message={vehicleForm.errors.color} />
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
                                    value={vehicleForm.data.capacity_kg}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'capacity_kg',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="1500"
                                />
                                <FieldError
                                    message={vehicleForm.errors.capacity_kg}
                                />
                            </div>
                        </div>

                        <FileField
                            id="vehicle_photo"
                            label="Foto del vehiculo"
                            required
                            error={vehicleForm.errors.vehicle_photo}
                            onChange={(file) =>
                                vehicleForm.setData('vehicle_photo', file)
                            }
                        />

                        <FileField
                            id="transit_license_image"
                            label="Imagen de la licencia de transito"
                            required
                            error={vehicleForm.errors.transit_license_image}
                            onChange={(file) =>
                                vehicleForm.setData(
                                    'transit_license_image',
                                    file,
                                )
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
                                    value={vehicleForm.data.insurance_expires_at}
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'insurance_expires_at',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                />
                                <FieldError
                                    message={
                                        vehicleForm.errors.insurance_expires_at
                                    }
                                />
                            </div>

                            <FileField
                                id="insurance_image"
                                label="Soporte del seguro"
                                required
                                error={vehicleForm.errors.insurance_image}
                                onChange={(file) =>
                                    vehicleForm.setData(
                                        'insurance_image',
                                        file,
                                    )
                                }
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
                                    value={
                                        vehicleForm.data
                                            .technical_review_expires_at
                                    }
                                    onChange={(event) =>
                                        vehicleForm.setData(
                                            'technical_review_expires_at',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                />
                                <FieldError
                                    message={
                                        vehicleForm.errors
                                            .technical_review_expires_at
                                    }
                                />
                            </div>

                            <FileField
                                id="technical_review_image"
                                label="Soporte de tecnico-mecanica"
                                required
                                error={vehicleForm.errors.technical_review_image}
                                onChange={(file) =>
                                    vehicleForm.setData(
                                        'technical_review_image',
                                        file,
                                    )
                                }
                            />
                        </div>

                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Al guardar, el vehiculo queda pendiente de revision.
                            Administracion debe aprobarlo antes de que puedas
                            publicar rutas.
                        </div>

                        <button
                            type="submit"
                            disabled={vehicleForm.processing}
                            className="inline-flex w-full justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
                        >
                            {vehicleForm.processing
                                ? 'Guardando...'
                                : 'Guardar vehiculo'}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <h4 className="text-sm font-semibold text-slate-900">
                            Vehiculos registrados
                        </h4>
                        <div className="mt-4 space-y-3">
                            {vehicles.length ? (
                                vehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {vehicle.plate} ·{' '}
                                                    {vehicle.vehicle_type}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {vehicle.brand}{' '}
                                                    {vehicle.model}{' '}
                                                    {vehicle.model_year} ·{' '}
                                                    {vehicle.capacity_kg} kg
                                                </p>
                                            </div>
                                            <StatusBadge
                                                status={vehicle.status}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState message="Aun no tienes vehiculos registrados." />
                            )}
                        </div>
                    </div>
                </article>

                <PublishRouteForm
                    vehicles={vehicles}
                    transporterProfile={transporterProfile}
                />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <article className={cardClassName()}>
                    <SectionTitle
                        eyebrow="Solicitudes"
                        title="Solicitudes recibidas"
                        description="Acepta o rechaza solicitudes de productores. Al aceptar, el servicio se confirma y el contacto queda habilitado para ambas partes."
                    />

                    <div className="mt-6 grid gap-4">
                        {incomingRequests.length ? (
                            incomingRequests.map((transportRequest) => (
                                <article
                                    key={transportRequest.id}
                                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h4 className="text-lg font-semibold text-slate-900">
                                                    {transportRequest.route?.origin}{' '}
                                                    {'->'}{' '}
                                                    {
                                                        transportRequest.route
                                                            ?.destination
                                                    }
                                                </h4>
                                                <StatusBadge
                                                    status={
                                                        transportRequest.status
                                                    }
                                                />
                                            </div>
                                            <p className="mt-3 text-sm text-slate-600">
                                                Productor:{' '}
                                                {
                                                    transportRequest.producer
                                                        ?.name
                                                }
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Producto:{' '}
                                                {
                                                    transportRequest.product_type
                                                }{' '}
                                                · Peso:{' '}
                                                {
                                                    transportRequest.cargo_weight_kg
                                                }{' '}
                                                kg
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Entrega:{' '}
                                                {
                                                    transportRequest.delivery_destination
                                                }
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Solicitado el{' '}
                                                {formatDate(
                                                    transportRequest.requested_at,
                                                )}
                                            </p>
                                            {transportRequest.estimated_cost ? (
                                                <p className="mt-1 text-sm text-slate-600">
                                                    Valor estimado:{' '}
                                                    {formatCurrency(
                                                        transportRequest.estimated_cost,
                                                    )}
                                                </p>
                                            ) : null}
                                        </div>

                                        {transportRequest.status === 'pending' ? (
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        requestDecisionForm.post(
                                                            route(
                                                                'transporter.transport-requests.accept',
                                                                transportRequest.id,
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                    disabled={
                                                        requestDecisionForm.processing
                                                    }
                                                    className="inline-flex rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                                                >
                                                    Aceptar y habilitar contacto
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        requestDecisionForm.post(
                                                            route(
                                                                'transporter.transport-requests.reject',
                                                                transportRequest.id,
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                    disabled={
                                                        requestDecisionForm.processing
                                                    }
                                                    className="inline-flex rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <EmptyState message="Todavia no has recibido solicitudes sobre tus rutas." />
                        )}
                    </div>
                </article>

                <article className={cardClassName()}>
                    <SectionTitle
                        eyebrow="Confirmacion"
                        title="Servicios con contacto activo"
                        description="Desde aqui puedes llamar o abrir WhatsApp con un solo clic una vez aceptada la solicitud."
                    />

                    <div className="mt-6 grid gap-4">
                        {confirmedServices.length ? (
                            confirmedServices.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))
                        ) : (
                            <EmptyState message="Aun no tienes servicios confirmados con contacto habilitado." />
                        )}
                    </div>
                </article>
            </section>

            <section className={cardClassName()}>
                <SectionTitle
                    eyebrow="Persistencia"
                    title="Mis rutas registradas"
                    description="Consulta de las rutas almacenadas para el transportista autenticado y su capacidad restante."
                />

                <div className="mt-6 grid gap-4">
                    {myRoutes.length ? (
                        myRoutes.map((transportRoute) => (
                            <article
                                key={transportRoute.id}
                                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                            >
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h4 className="text-lg font-semibold text-slate-900">
                                                {transportRoute.origin} {'->'}{' '}
                                                {transportRoute.destination}
                                            </h4>
                                            <StatusBadge
                                                status={transportRoute.status}
                                            />
                                        </div>
                                        <p className="mt-3 text-sm text-slate-600">
                                            Salida:{' '}
                                            {formatDate(
                                                transportRoute.departure_at,
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Vehiculo:{' '}
                                            {
                                                transportRoute.vehicle
                                                    ?.vehicle_type
                                            }{' '}
                                            ·{' '}
                                            {transportRoute.vehicle?.plate}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Capacidad disponible:{' '}
                                            {
                                                transportRoute.available_capacity_kg
                                            }{' '}
                                            kg · Solicitudes:{' '}
                                            {
                                                transportRoute.transport_requests_count
                                            }
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <EmptyState message="Aun no has publicado rutas." />
                    )}
                </div>
            </section>
        </>
    );
}

function ProducerView({ availableRoutes, myRequests, confirmedServices }) {
    const requestForm = useForm({
        transport_route_id: availableRoutes[0]?.id ?? '',
        cargo_weight_kg: '',
        product_type: '',
        delivery_destination: '',
        estimated_cost: '',
    });

    return (
        <>
            <section className={cardClassName()}>
                <SectionTitle
                    eyebrow="Servicios"
                    title="Servicios confirmados y contacto"
                    description="Los datos del transportista solo aparecen cuando la solicitud es aceptada. Desde esta confirmacion puedes llamar o abrir WhatsApp en un clic."
                />

                <div className="mt-6 grid gap-4">
                    {confirmedServices.length ? (
                        confirmedServices.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))
                    ) : (
                        <EmptyState message="Todavia no tienes servicios confirmados." />
                    )}
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <article className={cardClassName()}>
                    <SectionTitle
                        eyebrow="Rutas disponibles"
                        title="Buscar rutas publicadas"
                        description="Solo ves rutas futuras de transportistas aprobados. Antes de la aceptacion se protege la privacidad del contacto."
                    />

                    <div className="mt-6 grid gap-4">
                        {availableRoutes.length ? (
                            availableRoutes.map((transportRoute) => (
                                <article
                                    key={transportRoute.id}
                                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-lg font-semibold text-slate-900">
                                            {transportRoute.origin} {'->'}{' '}
                                            {transportRoute.destination}
                                        </h4>
                                        <StatusBadge
                                            status={transportRoute.status}
                                        />
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                        Salida:{' '}
                                        {formatDate(transportRoute.departure_at)}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Transportista:{' '}
                                        {transportRoute.transporter?.name}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Vehiculo:{' '}
                                        {
                                            transportRoute.vehicle
                                                ?.vehicle_type
                                        }{' '}
                                        · {transportRoute.vehicle?.plate}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Capacidad disponible:{' '}
                                        {transportRoute.available_capacity_kg} kg
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Carga permitida:{' '}
                                        {
                                            transportRoute.permitted_cargo_type
                                        }
                                    </p>
                                </article>
                            ))
                        ) : (
                            <EmptyState message="No hay rutas publicadas disponibles en este momento." />
                        )}
                    </div>
                </article>

                <article className={cardClassName()}>
                    <SectionTitle
                        eyebrow="Solicitud"
                        title="Registrar carga"
                        description="Crea una solicitud sobre una ruta publicada. El telefono del transportista solo se habilita despues de la aceptacion."
                    />

                    <form
                        className="mt-6 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            requestForm.post(
                                route('producer.transport-requests.store'),
                                {
                                    preserveScroll: true,
                                    onSuccess: () =>
                                        requestForm.reset(
                                            'cargo_weight_kg',
                                            'product_type',
                                            'delivery_destination',
                                            'estimated_cost',
                                        ),
                                },
                            );
                        }}
                    >
                        <div>
                            <label
                                htmlFor="transport_route_id"
                                className="text-sm font-medium text-slate-700"
                            >
                                Ruta
                            </label>
                            <select
                                id="transport_route_id"
                                value={requestForm.data.transport_route_id}
                                onChange={(event) =>
                                    requestForm.setData(
                                        'transport_route_id',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            >
                                <option value="">Selecciona una ruta</option>
                                {availableRoutes.map((transportRoute) => (
                                    <option
                                        key={transportRoute.id}
                                        value={transportRoute.id}
                                    >
                                        {transportRoute.origin} {'->'}{' '}
                                        {transportRoute.destination} -{' '}
                                        {formatDate(transportRoute.departure_at)}
                                    </option>
                                ))}
                            </select>
                            <FieldError
                                message={requestForm.errors.transport_route_id}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="cargo_weight_kg"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Peso de la carga
                                </label>
                                <input
                                    id="cargo_weight_kg"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={requestForm.data.cargo_weight_kg}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'cargo_weight_kg',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <FieldError
                                    message={requestForm.errors.cargo_weight_kg}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="estimated_cost"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Costo estimado
                                </label>
                                <input
                                    id="estimated_cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={requestForm.data.estimated_cost}
                                    onChange={(event) =>
                                        requestForm.setData(
                                            'estimated_cost',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                />
                                <FieldError
                                    message={requestForm.errors.estimated_cost}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="product_type"
                                className="text-sm font-medium text-slate-700"
                            >
                                Tipo de producto
                            </label>
                            <input
                                id="product_type"
                                value={requestForm.data.product_type}
                                onChange={(event) =>
                                    requestForm.setData(
                                        'product_type',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <FieldError
                                message={requestForm.errors.product_type}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="delivery_destination"
                                className="text-sm font-medium text-slate-700"
                            >
                                Destino de entrega
                            </label>
                            <input
                                id="delivery_destination"
                                value={requestForm.data.delivery_destination}
                                onChange={(event) =>
                                    requestForm.setData(
                                        'delivery_destination',
                                        event.target.value,
                                    )
                                }
                                className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                            />
                            <FieldError
                                message={
                                    requestForm.errors.delivery_destination
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={
                                requestForm.processing || !availableRoutes.length
                            }
                            className="inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                        >
                            Crear solicitud
                        </button>
                    </form>
                </article>
            </section>

            <section className={cardClassName()}>
                <SectionTitle
                    eyebrow="Seguimiento"
                    title="Mis solicitudes"
                    description="Consulta el estado de tus solicitudes. El contacto solo se revela cuando el servicio queda confirmado."
                />

                <div className="mt-6 grid gap-4">
                    {myRequests.length ? (
                        myRequests.map((transportRequest) => (
                            <article
                                key={transportRequest.id}
                                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <h4 className="text-lg font-semibold text-slate-900">
                                        {transportRequest.route?.origin} {'->'}{' '}
                                        {transportRequest.route?.destination}
                                    </h4>
                                    <StatusBadge
                                        status={transportRequest.status}
                                    />
                                </div>
                                <p className="mt-3 text-sm text-slate-600">
                                    Solicitado el{' '}
                                    {formatDate(transportRequest.requested_at)}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Producto: {transportRequest.product_type} ·
                                    Peso: {transportRequest.cargo_weight_kg} kg
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Entrega:{' '}
                                    {
                                        transportRequest.delivery_destination
                                    }
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Transportista:{' '}
                                    {transportRequest.route?.transporter?.name}
                                </p>
                                {transportRequest.estimated_cost ? (
                                    <p className="mt-1 text-sm text-slate-600">
                                        Valor estimado:{' '}
                                        {formatCurrency(
                                            transportRequest.estimated_cost,
                                        )}
                                    </p>
                                ) : null}
                            </article>
                        ))
                    ) : (
                        <EmptyState message="Todavia no has creado solicitudes." />
                    )}
                </div>
            </section>
        </>
    );
}

export default function RoutesIndex({
    role,
    transporterProfile,
    vehicles,
    myRoutes,
    availableRoutes,
    myRequests,
    incomingRequests = [],
    confirmedServices = [],
}) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <SectionTitle
                    eyebrow="Operacion"
                    title="Rutas, solicitudes y contacto"
                    description="La plataforma ya registra rutas y solicitudes, permite aceptar o rechazar cargas y habilita el contacto directo solo entre las partes del servicio confirmado."
                />
            }
        >
            <Head title="Rutas y solicitudes" />

            <div className="py-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
                    <FlashMessages success={flash.success} error={flash.error} />

                    {role === 'transportista' ? (
                        <TransporterView
                            transporterProfile={transporterProfile}
                            vehicles={vehicles}
                            myRoutes={myRoutes}
                            incomingRequests={incomingRequests}
                            confirmedServices={confirmedServices}
                        />
                    ) : null}

                    {role === 'productor' ? (
                        <ProducerView
                            availableRoutes={availableRoutes}
                            myRequests={myRequests}
                            confirmedServices={confirmedServices}
                        />
                    ) : null}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
