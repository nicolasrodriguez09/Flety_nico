<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_AVAILABLE = 'available';

    public const STATUS_UNAVAILABLE = 'unavailable';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'transporter_id',
        'plate',
        'vehicle_type',
        'brand',
        'model',
        'model_year',
        'color',
        'capacity_kg',
        'vehicle_photo_path',
        'transit_license_image_path',
        'insurance_expires_at',
        'insurance_image_path',
        'technical_review_expires_at',
        'technical_review_image_path',
        'status',
        'reviewed_by_admin_id',
        'reviewed_at',
        'review_notes',
    ];

    protected function casts(): array
    {
        return [
            'capacity_kg' => 'decimal:2',
            'model_year' => 'integer',
            'insurance_expires_at' => 'date',
            'technical_review_expires_at' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    public function transporter(): BelongsTo
    {
        return $this->belongsTo(Transporter::class);
    }

    public function routes(): HasMany
    {
        return $this->hasMany(TransportRoute::class);
    }
}
