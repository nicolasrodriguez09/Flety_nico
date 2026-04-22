<?php

namespace Database\Seeders;

use App\Models\Producer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProducerUserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roleId = Role::query()
            ->where('slug', Role::PRODUCER)
            ->value('id');

        $user = User::query()->updateOrCreate(
            ['email' => 'productor@flety.test'],
            [
                'role_id' => $roleId,
                'name' => 'Productor Flety',
                'phone' => '3002223344',
                'status' => 'active',
                'email_verified_at' => now(),
                'password' => 'password',
            ],
        );

        Producer::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'farm_name' => 'Finca La Esperanza',
                'farm_location' => 'Boyaca',
                'production_type' => 'Papa y hortalizas',
                'rating_average' => 4.6,
            ],
        );
    }
}
