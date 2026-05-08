import RouteMap from '@/Components/RouteMap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

function toDateTimeLocal(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    return offsetDate.toISOString().slice(0, 16);
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

function hasRouteCoordinates(route) {
    return (
        Number.isFinite(Number(route.origin_lat)) &&
        Number.isFinite(Number(route.origin_lng)) &&
        Number.isFinite(Number(route.destination_lat)) &&
        Number.isFinite(Number(route.destination_lng))
    );
}

function cardClassName(extra = '') {
    return `animate-panel-rise rounded-2xl border border-[#dfe8dc] bg-white p-4 shadow-[0_18px_42px_-34px_rgba(31,74,49,0.35)] sm:p-6 ${extra}`.trim();
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
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
        <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-sm text-slate-500">
            {message}
        </div>
    );
}

function FlashMessages({ success, error }) {
    return (
        <>
            {success ? (
                <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                    {success}
                </section>
            ) : null}
            {error ? (
                <section className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
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
        origin_lat: '',
        origin_lng: '',
        destination: '',
        destination_lat: '',
        destination_lng: '',
        departure_at: '',
        available_capacity_kg: '',
        permitted_cargo_type: '',
    });

    const [selectionMode, setSelectionMode] = useState('origin');

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
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    routeForm.post(route('transporter.routes.store'), {
                        preserveScroll: true,
                        onSuccess: () => {
                            alert('Ruta publicada correctamente');

                            routeForm.reset(
                                'origin',
                                'origin_lat',
                                'origin_lng',
                                'destination',
                                'destination_lat',
                                'destination_lng',
                                'departure_at',
                                'available_capacity_kg',
                                'permitted_cargo_type',
                            );
                        },
                        onError: (errors) => {
                            console.log('Errores al publicar ruta:', errors);
                            alert('No se pudo publicar la ruta. Revisa la consola del navegador.');
                        },
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
                
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Ubicación en mapa
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                                Selecciona primero el punto de salida y luego el punto de llegada.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectionMode('origin')}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                    selectionMode === 'origin'
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-white text-slate-700'
                                }`}
                            >
                                Marcar salida
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectionMode('destination')}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                    selectionMode === 'destination'
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-white text-slate-700'
                                }`}
                            >
                                Marcar llegada
                            </button>
                        </div>
                    </div>

                    <RouteMap
                        selectable
                        selectionMode={selectionMode}
                        originPoint={
                            routeForm.data.origin_lat && routeForm.data.origin_lng
                                ? {
                                    lat: Number(routeForm.data.origin_lat),
                                    lng: Number(routeForm.data.origin_lng),
                                }
                                : null
                        }
                        destinationPoint={
                            routeForm.data.destination_lat && routeForm.data.destination_lng
                                ? {
                                    lat: Number(routeForm.data.destination_lat),
                                    lng: Number(routeForm.data.destination_lng),
                                }
                                : null
                        }
                        onSelectPoint={(point) => {
                            if (point.type === 'origin') {
                                routeForm.setData({
                                    ...routeForm.data,
                                    origin_lat: point.lat,
                                    origin_lng: point.lng,
                                });
                                setSelectionMode('destination');
                            }

                            if (point.type === 'destination') {
                                routeForm.setData({
                                    ...routeForm.data,
                                    destination_lat: point.lat,
                                    destination_lng: point.lng,
                                });
                            }
                        }}
                    />

                    <div className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3">
                            <strong>Salida:</strong>{' '}
                            {routeForm.data.origin_lat && routeForm.data.origin_lng
                                ? `${routeForm.data.origin_lat}, ${routeForm.data.origin_lng}`
                                : 'Sin seleccionar'}
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-3">
                            <strong>Llegada:</strong>{' '}
                            {routeForm.data.destination_lat && routeForm.data.destination_lng
                                ? `${routeForm.data.destination_lat}, ${routeForm.data.destination_lng}`
                                : 'Sin seleccionar'}
                        </div>
                    </div>

                    <FieldError message={routeForm.errors.origin_lat} />
                    <FieldError message={routeForm.errors.destination_lat} />
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
                    disabled={routeForm.processing}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {routeForm.processing ? 'Publicando...' : 'Publicar ruta'}
                </button>
            </form>
        </article>
    );
}

function EditRouteForm({ transportRoute, vehicles, onCancel, onSuccess }) {
    const currentVehicleId = transportRoute.vehicle?.id ?? '';
    const baseVehicleOptions = vehicles.filter(
        (vehicle) =>
            vehicle.status === 'available' ||
            String(vehicle.id) === String(currentVehicleId),
    );
    const hasCurrentVehicle = baseVehicleOptions.some(
        (vehicle) => String(vehicle.id) === String(currentVehicleId),
    );
    const vehicleOptions =
        transportRoute.vehicle?.id && !hasCurrentVehicle
            ? [
                  {
                      id: transportRoute.vehicle.id,
                      plate: transportRoute.vehicle.plate,
                      vehicle_type: transportRoute.vehicle.vehicle_type,
                      capacity_kg: transportRoute.vehicle.capacity_kg,
                      status: 'available',
                  },
                  ...baseVehicleOptions,
              ]
            : baseVehicleOptions;

    const editForm = useForm({
        vehicle_id: currentVehicleId,
        origin: transportRoute.origin ?? '',
        origin_lat: transportRoute.origin_lat ?? '',
        origin_lng: transportRoute.origin_lng ?? '',
        destination: transportRoute.destination ?? '',
        destination_lat: transportRoute.destination_lat ?? '',
        destination_lng: transportRoute.destination_lng ?? '',
        departure_at: toDateTimeLocal(transportRoute.departure_at),
        available_capacity_kg: transportRoute.available_capacity_kg ?? '',
        permitted_cargo_type: transportRoute.permitted_cargo_type ?? '',
    });
    const [selectionMode, setSelectionMode] = useState('origin');

    const selectedVehicle = vehicleOptions.find(
        (vehicle) => String(vehicle.id) === String(editForm.data.vehicle_id),
    );
    const canSubmit =
        editForm.data.vehicle_id &&
        editForm.data.origin.trim() &&
        editForm.data.destination.trim() &&
        editForm.data.departure_at &&
        Number(editForm.data.available_capacity_kg) > 0 &&
        (!selectedVehicle ||
            Number(editForm.data.available_capacity_kg) <=
                Number(selectedVehicle.capacity_kg)) &&
        editForm.data.permitted_cargo_type.trim();

    const originPoint =
        editForm.data.origin_lat && editForm.data.origin_lng
            ? {
                  lat: Number(editForm.data.origin_lat),
                  lng: Number(editForm.data.origin_lng),
              }
            : null;
    const destinationPoint =
        editForm.data.destination_lat && editForm.data.destination_lng
            ? {
                  lat: Number(editForm.data.destination_lat),
                  lng: Number(editForm.data.destination_lng),
              }
            : null;

    return (
        <form
            className="mt-5 space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
            noValidate
            onSubmit={(event) => {
                event.preventDefault();

                editForm.patch(
                    route('transporter.routes.update', transportRoute.id),
                    {
                        preserveScroll: true,
                        onSuccess,
                    },
                );
            }}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                        Editar ruta
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Actualiza origen, destino, fecha y capacidad disponible.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Cancelar
                </button>
            </div>

            <div>
                <label
                    htmlFor={`edit_vehicle_id_${transportRoute.id}`}
                    className="text-sm font-medium text-slate-700"
                >
                    Vehiculo
                </label>
                <select
                    id={`edit_vehicle_id_${transportRoute.id}`}
                    required
                    value={editForm.data.vehicle_id}
                    onChange={(event) =>
                        editForm.setData('vehicle_id', event.target.value)
                    }
                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                >
                    <option value="">Selecciona un vehiculo</option>
                    {vehicleOptions.map((vehicle) => (
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
                <FieldError message={editForm.errors.vehicle_id} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label
                        htmlFor={`edit_origin_${transportRoute.id}`}
                        className="text-sm font-medium text-slate-700"
                    >
                        Origen
                    </label>
                    <input
                        id={`edit_origin_${transportRoute.id}`}
                        required
                        value={editForm.data.origin}
                        onChange={(event) =>
                            editForm.setData('origin', event.target.value)
                        }
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                    <FieldError message={editForm.errors.origin} />
                </div>

                <div>
                    <label
                        htmlFor={`edit_destination_${transportRoute.id}`}
                        className="text-sm font-medium text-slate-700"
                    >
                        Destino
                    </label>
                    <input
                        id={`edit_destination_${transportRoute.id}`}
                        required
                        value={editForm.data.destination}
                        onChange={(event) =>
                            editForm.setData('destination', event.target.value)
                        }
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                    <FieldError message={editForm.errors.destination} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label
                        htmlFor={`edit_departure_at_${transportRoute.id}`}
                        className="text-sm font-medium text-slate-700"
                    >
                        Fecha y hora de salida
                    </label>
                    <input
                        id={`edit_departure_at_${transportRoute.id}`}
                        type="datetime-local"
                        required
                        value={editForm.data.departure_at}
                        onChange={(event) =>
                            editForm.setData('departure_at', event.target.value)
                        }
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                    <FieldError message={editForm.errors.departure_at} />
                </div>

                <div>
                    <label
                        htmlFor={`edit_available_capacity_${transportRoute.id}`}
                        className="text-sm font-medium text-slate-700"
                    >
                        Capacidad disponible
                    </label>
                    <input
                        id={`edit_available_capacity_${transportRoute.id}`}
                        type="number"
                        required
                        inputMode="decimal"
                        min="1"
                        max={selectedVehicle?.capacity_kg}
                        step="0.01"
                        value={editForm.data.available_capacity_kg}
                        onChange={(event) =>
                            editForm.setData(
                                'available_capacity_kg',
                                event.target.value,
                            )
                        }
                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                    <FieldError message={editForm.errors.available_capacity_kg} />
                </div>
            </div>

            <div>
                <label
                    htmlFor={`edit_permitted_cargo_type_${transportRoute.id}`}
                    className="text-sm font-medium text-slate-700"
                >
                    Tipo de carga permitida
                </label>
                <input
                    id={`edit_permitted_cargo_type_${transportRoute.id}`}
                    required
                    value={editForm.data.permitted_cargo_type}
                    onChange={(event) =>
                        editForm.setData(
                            'permitted_cargo_type',
                            event.target.value,
                        )
                    }
                    className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
                <FieldError message={editForm.errors.permitted_cargo_type} />
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Puntos de mapa
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                            Puedes conservar los puntos actuales o marcarlos de nuevo.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectionMode('origin')}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                selectionMode === 'origin'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-white text-slate-700'
                            }`}
                        >
                            Marcar salida
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectionMode('destination')}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                selectionMode === 'destination'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-white text-slate-700'
                            }`}
                        >
                            Marcar llegada
                        </button>
                    </div>
                </div>

                <RouteMap
                    selectable
                    selectionMode={selectionMode}
                    originPoint={originPoint}
                    destinationPoint={destinationPoint}
                    height="300px"
                    onSelectPoint={(point) => {
                        if (point.type === 'origin') {
                            editForm.setData({
                                ...editForm.data,
                                origin_lat: point.lat,
                                origin_lng: point.lng,
                            });
                            setSelectionMode('destination');
                        }

                        if (point.type === 'destination') {
                            editForm.setData({
                                ...editForm.data,
                                destination_lat: point.lat,
                                destination_lng: point.lng,
                            });
                        }
                    }}
                />

                <div className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-3">
                        <strong>Salida:</strong>{' '}
                        {originPoint
                            ? `${editForm.data.origin_lat}, ${editForm.data.origin_lng}`
                            : 'Sin seleccionar'}
                    </div>

                    <div className="rounded-2xl bg-white px-4 py-3">
                        <strong>Llegada:</strong>{' '}
                        {destinationPoint
                            ? `${editForm.data.destination_lat}, ${editForm.data.destination_lng}`
                            : 'Sin seleccionar'}
                    </div>
                </div>

                <FieldError message={editForm.errors.origin_lat} />
                <FieldError message={editForm.errors.destination_lat} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <button
                    type="submit"
                    disabled={!canSubmit || editForm.processing}
                    className="inline-flex justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {editForm.processing ? 'Guardando...' : 'Guardar cambios'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Cerrar edicion
                </button>
            </div>
        </form>
    );
}

function TransporterView({
    transporterProfile,
    vehicles,
    myRoutes,
    incomingRequests,
    confirmedServices,
}) {
    const requestDecisionForm = useForm({});
    const [editingRouteId, setEditingRouteId] = useState(null);

    const deleteRoute = (transportRoute) => {
        if (
            !window.confirm(
                `Eliminar definitivamente la ruta ${transportRoute.origin} -> ${transportRoute.destination}?`,
            )
        ) {
            return;
        }

        router.delete(route('transporter.routes.destroy', transportRoute.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (editingRouteId === transportRoute.id) {
                    setEditingRouteId(null);
                }
            },
        });
    };

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

            <section>
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
                    eyebrow="Mapa"
                    title="Visualización de mis rutas"
                    description="Aquí puedes ver en el mapa las rutas de retorno que tienen puntos de salida y llegada registrados."
                />

                <div className="mt-6">
                    {myRoutes.some(
                        (route) =>
                            route.origin_lat &&
                            route.origin_lng &&
                            route.destination_lat &&
                            route.destination_lng,
                    ) ? (
                        <RouteMap routes={myRoutes} height="420px" />
                    ) : (
                        <EmptyState message="Todavía no tienes rutas con puntos seleccionados en el mapa." />
                    )}
                </div>
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
                                className="interactive-lift rounded-3xl border border-slate-200 bg-slate-50 p-5 transition"
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
                                        <p className="mt-1 text-sm text-slate-600">
                                            Carga permitida:{' '}
                                            {transportRoute.permitted_cargo_type}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingRouteId(
                                                    editingRouteId ===
                                                        transportRoute.id
                                                        ? null
                                                        : transportRoute.id,
                                                )
                                            }
                                            className="inline-flex justify-center rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                                        >
                                            {editingRouteId === transportRoute.id
                                                ? 'Ocultar'
                                                : 'Editar'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteRoute(transportRoute)
                                            }
                                            className="inline-flex justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>

                                {editingRouteId === transportRoute.id ? (
                                    <EditRouteForm
                                        transportRoute={transportRoute}
                                        vehicles={vehicles}
                                        onCancel={() => setEditingRouteId(null)}
                                        onSuccess={() => setEditingRouteId(null)}
                                    />
                                ) : null}
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

function ProducerView({ availableRoutes, routeFilters = {} }) {
    const [searchFilters, setSearchFilters] = useState({
        origin: routeFilters.origin ?? '',
        destination: routeFilters.destination ?? '',
        cargo_weight_kg: routeFilters.cargo_weight_kg ?? '',
    });
    const hasActiveSearch =
        Boolean(routeFilters.origin) ||
        Boolean(routeFilters.destination) ||
        Boolean(routeFilters.cargo_weight_kg);

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            route('producer.routes.index'),
            {
                origin: searchFilters.origin.trim() || undefined,
                destination: searchFilters.destination.trim() || undefined,
                cargo_weight_kg:
                    Number(searchFilters.cargo_weight_kg) > 0
                        ? searchFilters.cargo_weight_kg
                        : undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const clearSearch = () => {
        setSearchFilters({
            origin: '',
            destination: '',
            cargo_weight_kg: '',
        });

        router.get(
            route('producer.routes.index'),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <section className={cardClassName()}>
                <SectionTitle
                    eyebrow="Busqueda"
                    title="Buscar rutas cercanas"
                    description="Filtra rutas activas por tu zona de salida y zona de llegada para encontrar transportistas disponibles para tu carga."
                />

                <form
                    className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr_auto]"
                    noValidate
                    onSubmit={submitSearch}
                >
                    <div>
                        <label
                            htmlFor="search_origin"
                            className="text-sm font-medium text-slate-700"
                        >
                            Zona de salida o interes
                        </label>
                        <input
                            id="search_origin"
                            value={searchFilters.origin}
                            onChange={(event) =>
                                setSearchFilters((current) => ({
                                    ...current,
                                    origin: event.target.value,
                                }))
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Ej. Tunja"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="search_destination"
                            className="text-sm font-medium text-slate-700"
                        >
                            Zona de llegada o destino
                        </label>
                        <input
                            id="search_destination"
                            value={searchFilters.destination}
                            onChange={(event) =>
                                setSearchFilters((current) => ({
                                    ...current,
                                    destination: event.target.value,
                                }))
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Ej. Bogota"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="search_cargo_weight"
                            className="text-sm font-medium text-slate-700"
                        >
                            Peso de carga
                        </label>
                        <input
                            id="search_cargo_weight"
                            type="number"
                            inputMode="decimal"
                            min="1"
                            step="0.01"
                            value={searchFilters.cargo_weight_kg}
                            onChange={(event) =>
                                setSearchFilters((current) => ({
                                    ...current,
                                    cargo_weight_kg: event.target.value,
                                }))
                            }
                            className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                            placeholder="Ej. 800 kg"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row xl:items-end">
                        <button
                            type="submit"
                            className="interactive-lift inline-flex justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                        >
                            Buscar rutas cercanas
                        </button>

                        {hasActiveSearch ? (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="interactive-lift inline-flex justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                            >
                                Limpiar
                            </button>
                        ) : null}
                    </div>
                </form>

                <p className="mt-4 text-sm text-slate-600">
                    {availableRoutes.length === 1
                        ? '1 ruta disponible encontrada.'
                        : `${availableRoutes.length} rutas disponibles encontradas.`}
                </p>
            </section>

            <section className={cardClassName()}>
                    <SectionTitle
                        eyebrow="Rutas disponibles"
                        title="Resultados de busqueda"
                        description="Revisa una vista previa de cada ruta cercana. Para enviar tu carga, abre el detalle de la ruta seleccionada."
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
                                    {transportRoute.distance_km ||
                                    transportRoute.estimated_duration_minutes ? (
                                        <p className="mt-1 text-sm text-slate-600">
                                            Recorrido:{' '}
                                            {transportRoute.distance_km
                                                ? `${transportRoute.distance_km} km`
                                                : 'Distancia pendiente'}
                                            {' - '}
                                            {transportRoute.estimated_duration_minutes
                                                ? `${transportRoute.estimated_duration_minutes} min`
                                                : 'duracion pendiente'}
                                        </p>
                                    ) : null}
                                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-white px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                            Costo estimado
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-slate-900">
                                            {transportRoute.estimated_cost
                                                ? formatCurrency(
                                                    transportRoute.estimated_cost,
                                                )
                                                : 'Ingresa el peso para estimar'}
                                        </p>
                                    </div>
                                    <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-2">
                                        {hasRouteCoordinates(transportRoute) ? (
                                            <RouteMap
                                                routes={[transportRoute]}
                                                height="240px"
                                            />
                                        ) : (
                                            <div className="flex min-h-[210px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-500">
                                                Esta ruta aun no tiene puntos de mapa registrados.
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={route(
                                            'producer.routes.show',
                                            {
                                                transportRoute:
                                                    transportRoute.id,
                                                cargo_weight_kg:
                                                    routeFilters.cargo_weight_kg ||
                                                    undefined,
                                            },
                                        )}
                                        className="interactive-lift mt-4 inline-flex rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                                    >
                                        Solicitar carga
                                    </Link>
                                </article>
                            ))
                        ) : (
                            <EmptyState message="No hay rutas cercanas disponibles con esos filtros." />
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
    routeFilters = {},
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

            <div className="bg-[linear-gradient(180deg,#eef7ec_0%,#f7faf4_100%)] py-5 sm:py-7">
                <div className="mx-auto flex max-w-[1540px] flex-col gap-5 px-3 sm:px-5 lg:px-8">
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
                            routeFilters={routeFilters}
                            myRequests={myRequests}
                            confirmedServices={confirmedServices}
                        />
                    ) : null}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
