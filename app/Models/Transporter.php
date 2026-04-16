<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transporter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'identity_document',
        'driver_license',
        'validation_status',
        'rating_average',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
