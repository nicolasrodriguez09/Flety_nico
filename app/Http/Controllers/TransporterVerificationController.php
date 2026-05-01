<?php

namespace App\Http\Controllers;

use App\Models\DocumentVerification;
use App\Models\Transporter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransporterVerificationController extends Controller
{
    public function index(): Response
    {
        $pendingTransporters = Transporter::query()
            ->with(['user:id,name,email,phone', 'documentVerifications'])
            ->where('validation_status', Transporter::STATUS_PENDING)
            ->latest()
            ->get();

        return Inertia::render('Admin/Transporters/Index', [
            'transporters' => $pendingTransporters
                ->map(fn (Transporter $transporter) => [
                    'id' => $transporter->id,
                    'name' => $transporter->user?->name ?? 'Transportista',
                    'email' => $transporter->user?->email,
                    'phone' => $transporter->user?->phone,
                    'identity_document' => $transporter->identity_document,
                    'driver_license' => $transporter->driver_license,
                    'validation_status' => $transporter->validation_status,
                    'documents' => $transporter->documentVerifications
                        ->map(fn (DocumentVerification $document) => [
                            'id' => $document->id,
                            'label' => $this->documentLabel($document),
                            'review_status' => $document->review_status,
                            'href' => route('admin.transporter-documents.show', $document),
                        ])
                        ->values(),
                    'approve_url' => route('admin.transporters.approve', $transporter),
                    'reject_url' => route('admin.transporters.reject', $transporter),
                ])
                ->values(),
        ]);
    }

    public function approve(Request $request, Transporter $transporter): RedirectResponse
    {
        $transporter->update([
            'validation_status' => Transporter::STATUS_APPROVED,
        ]);

        $transporter->documentVerifications()->update([
            'validated_by_admin_id' => $request->user()->id,
            'review_status' => DocumentVerification::STATUS_APPROVED,
            'review_notes' => null,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Transportista validado correctamente.');
    }

    public function reject(Request $request, Transporter $transporter): RedirectResponse
    {
        $transporter->update([
            'validation_status' => Transporter::STATUS_REJECTED,
        ]);

        $transporter->documentVerifications()->update([
            'validated_by_admin_id' => $request->user()->id,
            'review_status' => DocumentVerification::STATUS_REJECTED,
            'review_notes' => 'Rechazado desde el panel administrativo.',
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Transportista rechazado correctamente.');
    }

    public function showDocument(DocumentVerification $documentVerification): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($documentVerification->file_path), 404);

        return Storage::disk('local')->response($documentVerification->file_path);
    }

    private function documentLabel(DocumentVerification $document): string
    {
        return match ($document->document_type) {
            DocumentVerification::TYPE_IDENTITY_DOCUMENT => 'Documento de identidad',
            DocumentVerification::TYPE_DRIVER_LICENSE => 'Licencia de conduccion',
            default => 'Documento',
        };
    }
}
