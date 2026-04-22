<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'shared_phone',
        'shared_whatsapp',
        'enabled_at',
    ];

    protected function casts(): array
    {
        return [
            'enabled_at' => 'datetime',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
