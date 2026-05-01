<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentVerification extends Model
{
    use HasFactory;

    public const TYPE_IDENTITY_DOCUMENT = 'identity_document';
    public const TYPE_DRIVER_LICENSE = 'driver_license';

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'transporter_id',
        'validated_by_admin_id',
        'document_type',
        'file_path',
        'review_status',
        'review_notes',
        'uploaded_at',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function transporter(): BelongsTo
    {
        return $this->belongsTo(Transporter::class);
    }

    public function validatedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by_admin_id');
    }
}
