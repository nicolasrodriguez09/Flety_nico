<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roleId = Role::query()
            ->where('slug', Role::ADMIN)
            ->value('id');

        User::query()->updateOrCreate(
            ['email' => 'admin@flety.test'],
            [
                'role_id' => $roleId,
                'name' => 'Administrador Flety',
                'phone' => '3003334455',
                'status' => 'active',
                'email_verified_at' => now(),
                'password' => 'password',
            ],
        );
    }
}
