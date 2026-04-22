<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'farm_name',
        'farm_location',
        'production_type',
        'rating_average',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transportRequests(): HasMany
    {
        return $this->hasMany(TransportRequest::class);
    }

    public function services(): HasMany
    {
        return $this->hasManyThrough(
            Service::class,
            TransportRequest::class,
            'producer_id',
            'transport_request_id',
            'id',
            'id',
        );
    }
}
