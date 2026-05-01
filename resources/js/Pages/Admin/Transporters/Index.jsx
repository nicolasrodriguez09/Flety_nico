import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

const statusLabels = {
    approved: 'Aprobado',
    pending: 'Pendiente',
    rejected: 'Rechazado',
};

function StatusBadge({ status }) {
    const styles = {
        approved: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        rejected: 'bg-rose-100 text-rose-700',
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}
        >
            {statusLabels[status] ?? status}
        </span>
    );
}

function TransporterCard({ transporter }) {
    const submitDecision = (href) => {
        router.post(href, {}, { preserveScroll: true });
    };

    return (
        <article className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-slate-900">
                            {transporter.name}
                        </h3>
                        <StatusBadge status={transporter.validation_status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                        {transporter.email ?? 'Sin correo'} ·{' '}
                        {transporter.phone ?? 'Sin telefono'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                        Documento: {transporter.identity_document ?? 'Sin dato'} ·
                        Licencia: {transporter.driver_license ?? 'Sin dato'}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => submitDecision(transporter.approve_url)}
                        className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                        Validar
                    </button>
                    <button
                        type="button"
                        onClick={() => submitDecision(transporter.reject_url)}
                        className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                        Rechazar
                    </button>
                </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
                {transporter.documents.length ? (
                    transporter.documents.map((document) => (
                        <a
                            key={document.id}
                            href={document.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                        >
                            <p className="text-sm font-semibold text-slate-900">
                                {document.label}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                                {statusLabels[document.review_status] ??
                                    document.review_status}
                            </p>
                        </a>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 md:col-span-2">
                        Este transportista aun no tiene documentos cargados.
                    </div>
                )}
            </div>
        </article>
    );
}

export default function AdminTransportersIndex({ transporters = [] }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                        Administracion
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-900">
                        Validar transportistas
                    </h2>
                </div>
            }
        >
            <Head title="Validar transportistas" />

            <div className="py-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
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

                    <section className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                                Pendientes
                            </p>
                            <h3 className="text-2xl font-semibold text-slate-900">
                                Revision documental
                            </h3>
                            <p className="max-w-3xl text-sm leading-6 text-slate-600">
                                Revisa documento de identidad y licencia de
                                conduccion antes de habilitar al transportista
                                para publicar rutas.
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-4">
                        {transporters.length ? (
                            transporters.map((transporter) => (
                                <TransporterCard
                                    key={transporter.id}
                                    transporter={transporter}
                                />
                            ))
                        ) : (
                            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-sm text-slate-500">
                                No hay transportistas pendientes por validar.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
