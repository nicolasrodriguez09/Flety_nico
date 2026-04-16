<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
