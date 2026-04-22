<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Service extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'transport_request_id',
        'transport_route_id',
        'confirmed_at',
        'status',
        'agreed_payment_method',
        'agreed_amount',
    ];

    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
            'agreed_amount' => 'decimal:2',
        ];
    }

    public function transportRequest(): BelongsTo
    {
        return $this->belongsTo(TransportRequest::class);
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(TransportRoute::class, 'transport_route_id');
    }

    public function contact(): HasOne
    {
        return $this->hasOne(ServiceContact::class);
    }
}
