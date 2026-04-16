<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    public const TRANSPORTER = 'transportista';
    public const PRODUCER = 'productor';
    public const ADMIN = 'administrador';

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public static function publicRegistrationSlugs(): array
    {
        return [
            self::TRANSPORTER,
            self::PRODUCER,
        ];
    }
}
