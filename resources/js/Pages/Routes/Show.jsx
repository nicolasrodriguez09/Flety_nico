import RouteMap from '@/Components/RouteMap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function formatDate(value) {
    if (!value) {
        return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function hasRouteCoordinates(route) {
    return (
        Number.isFinite(Number(route?.origin_lat)) &&
        Number.isFinite(Number(route?.origin_lng)) &&
        Number.isFinite(Number(route?.destination_lat)) &&
        Number.isFinite(Number(route?.destination_lng))
    );
}

function DetailItem({ label, value }) {
    return (
        <div className="rounded-2xl border border-[#dfe8dc] bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f7b72]">
                {label}
            </p>
            <p className="mt-2 text-base font-semibold text-[#203029]">
                {value || 'Sin dato'}
            </p>
        </div>
    );
}

function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

export default function Show({ transportRoute }) {
    const { flash } = usePage().props;
    const hasMap = hasRouteCoordinates(transportRoute);
    const requestForm = useForm({
        transport_route_id: transportRoute.id,
        cargo_weight_kg: '',
        product_type: '',
        delivery_destination: '',
        estimated_cost: '',
    });
    const canSubmit =
        Number(requestForm.data.cargo_weight_kg) > 0 &&
        Number(requestForm.data.cargo_weight_kg) <=
            Number(transportRoute.available_capacity_kg) &&
        requestForm.data.product_type.trim() &&
        requestForm.data.delivery_destination.trim();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#427c46]">
                        Detalle de ruta
                    </p>
                    <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                        {transportRoute.origin} {'->'} {transportRoute.destination}
                    </h2>
                </div>
            }
        >
            <Head title="Detalle de ruta" />

            <div className="min-h-screen bg-[linear-gradient(180deg,#eef7ec_0%,#f7faf4_44%,#fbfcf8_100%)] px-4 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-5">
                    {flash.success ? (
                        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
                            {flash.success}
                        </section>
                    ) : null}
                    {flash.error ? (
                        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
                            {flash.error}
                        </section>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={route('producer.dashboard')}
                            className="inline-flex justify-center rounded-2xl border border-[#dce6d8] bg-white px-4 py-3 text-sm font-semibold text-[#3f6f4b] transition hover:bg-[#f4f8ef]"
                        >
                            Volver al panel
                        </Link>

                        <Link
                            href={route('producer.routes.index')}
                            className="inline-flex justify-center rounded-2xl bg-[#427c46] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#356b3f]"
                        >
                            Ver otras rutas
                        </Link>
                    </div>

                    <section className="animate-panel-rise overflow-hidden rounded-2xl border border-[#d8e8d4] bg-white p-4 shadow-[0_18px_44px_-36px_rgba(31,74,49,0.4)] sm:p-5">
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                    Mapa publicado
                                </p>
                                <h3 className="mt-2 text-2xl font-semibold text-[#203029]">
                                    Trayecto completo de la ruta
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[#52615a]">
                                    Esta vista muestra una sola ruta para revisar el recorrido sin mezclar otras publicaciones.
                                </p>
                            </div>
                            <span className="rounded-xl bg-[#edf4e8] px-4 py-3 text-sm font-semibold text-[#427c46]">
                                Publicada
                            </span>
                        </div>

                        {hasMap ? (
                            <RouteMap routes={[transportRoute]} height="560px" />
                        ) : (
                            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-[#cfe1cb] bg-[#f8fbf6] px-6 text-center text-sm text-[#647067]">
                                Esta ruta no tiene puntos de mapa registrados.
                            </div>
                        )}
                    </section>

                    <section className="animate-panel-rise rounded-2xl border border-[#d8e8d4] bg-[#f7fbf4] p-5 shadow-[0_18px_44px_-36px_rgba(31,74,49,0.35)] sm:p-6">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                Informacion de ruta
                            </p>
                            <h3 className="text-2xl font-semibold text-[#203029]">
                                Datos completos de la publicacion
                            </h3>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <DetailItem label="Origen" value={transportRoute.origin} />
                            <DetailItem label="Destino" value={transportRoute.destination} />
                            <DetailItem
                                label="Fecha de salida"
                                value={formatDate(transportRoute.departure_at)}
                            />
                            <DetailItem
                                label="Transportista"
                                value={transportRoute.transporter?.name}
                            />
                            <DetailItem
                                label="Vehiculo"
                                value={
                                    transportRoute.vehicle
                                        ? `${transportRoute.vehicle.vehicle_type} - ${transportRoute.vehicle.plate}`
                                        : null
                                }
                            />
                            <DetailItem
                                label="Capacidad disponible"
                                value={`${transportRoute.available_capacity_kg} kg`}
                            />
                            <DetailItem
                                label="Carga permitida"
                                value={transportRoute.permitted_cargo_type}
                            />
                            <DetailItem
                                label="Distancia"
                                value={
                                    transportRoute.distance_km
                                        ? `${transportRoute.distance_km} km`
                                        : 'Pendiente'
                                }
                            />
                            <DetailItem
                                label="Duracion estimada"
                                value={
                                    transportRoute.estimated_duration_minutes
                                        ? `${transportRoute.estimated_duration_minutes} min`
                                        : 'Pendiente'
                                }
                            />
                        </div>
                    </section>

                    <section className="animate-panel-rise rounded-2xl border border-[#d8e8d4] bg-white p-5 shadow-[0_18px_44px_-36px_rgba(31,74,49,0.35)] sm:p-6">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#427c46]">
                                Solicitud
                            </p>
                            <h3 className="text-2xl font-semibold text-[#203029]">
                                Solicitar carga para esta ruta
                            </h3>
                            <p className="max-w-3xl text-sm leading-6 text-[#52615a]">
                                Completa los datos de tu carga. El contacto del transportista solo se habilita cuando la solicitud sea aceptada.
                            </p>
                        </div>

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
                            <input
                                type="hidden"
                                value={requestForm.data.transport_route_id}
                                name="transport_route_id"
                            />

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
                                        required
                                        inputMode="decimal"
                                        min="1"
                                        max={transportRoute.available_capacity_kg}
                                        step="0.01"
                                        value={requestForm.data.cargo_weight_kg}
                                        onChange={(event) =>
                                            requestForm.setData(
                                                'cargo_weight_kg',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Ej. 800"
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
                                        inputMode="decimal"
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
                                        placeholder="Opcional"
                                    />
                                    <FieldError
                                        message={requestForm.errors.estimated_cost}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="product_type"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Tipo de producto
                                    </label>
                                    <input
                                        id="product_type"
                                        required
                                        maxLength="100"
                                        value={requestForm.data.product_type}
                                        onChange={(event) =>
                                            requestForm.setData(
                                                'product_type',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Ej. papa, cafe, hortalizas"
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
                                        required
                                        maxLength="255"
                                        value={
                                            requestForm.data.delivery_destination
                                        }
                                        onChange={(event) =>
                                            requestForm.setData(
                                                'delivery_destination',
                                                event.target.value,
                                            )
                                        }
                                        className="mt-2 block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Ej. Corabastos"
                                    />
                                    <FieldError
                                        message={
                                            requestForm.errors
                                                .delivery_destination
                                        }
                                    />
                                </div>
                            </div>

                            <FieldError
                                message={requestForm.errors.transport_route_id}
                            />

                            <button
                                type="submit"
                                disabled={!canSubmit || requestForm.processing}
                                className="interactive-lift inline-flex w-full justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60 sm:w-auto"
                            >
                                {requestForm.processing
                                    ? 'Enviando solicitud...'
                                    : 'Enviar solicitud de carga'}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
