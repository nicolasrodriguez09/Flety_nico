<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class TransportRoute extends Model
{
    use HasFactory;

    public const STATUS_PUBLISHED = 'published';
    public const STATUS_CLOSED = 'closed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_STARTING_SOON = 'starting_soon';

    protected $fillable = [
        'transporter_id',
        'vehicle_id',
        'origin',
        'origin_lat',
        'origin_lng',
        'destination',
        'destination_lat',
        'destination_lng',
        'departure_at',
        'available_capacity_kg',
        'distance_km',
        'estimated_duration_minutes',
        'permitted_cargo_type',
        'status',
        'route_geometry',
    ];

    protected function casts(): array
    {
        return [
            'departure_at' => 'datetime',
            'available_capacity_kg' => 'decimal:2',
            'origin_lat' => 'decimal:7',
            'origin_lng' => 'decimal:7',
            'destination_lat' => 'decimal:7',
            'destination_lng' => 'decimal:7',
            'distance_km' => 'decimal:2',
            'estimated_duration_minutes' => 'integer',
            'route_geometry' => 'array',
        ];
    }

    public function transporter(): BelongsTo
    {
        return $this->belongsTo(Transporter::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function transportRequests(): HasMany
    {
        return $this->hasMany(TransportRequest::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'transport_route_id');
    }

    public function operationalStatus(?Carbon $now = null): string
    {
        if ($this->status !== self::STATUS_PUBLISHED) {
            return $this->status;
        }

        $now ??= now();

        if ($this->departure_at && $this->departure_at->lessThanOrEqualTo($now)) {
            return self::STATUS_IN_PROGRESS;
        }

        if ($this->departure_at && $this->departure_at->lessThanOrEqualTo($now->copy()->addHours(5))) {
            return self::STATUS_STARTING_SOON;
        }

        return self::STATUS_PUBLISHED;
    }
}
