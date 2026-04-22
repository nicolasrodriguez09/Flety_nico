<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Transporter;
use App\Models\User;
use Illuminate\Database\Seeder;

class TransporterUserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roleId = Role::query()
            ->where('slug', Role::TRANSPORTER)
            ->value('id');

        $user = User::query()->updateOrCreate(
            ['email' => 'transportista@flety.test'],
            [
                'role_id' => $roleId,
                'name' => 'Transportista Flety',
                'phone' => '3001112233',
                'status' => 'active',
                'email_verified_at' => now(),
                'password' => 'password',
            ],
        );

        Transporter::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'identity_document' => '1045123456',
                'driver_license' => 'LICFLETY01',
                'validation_status' => Transporter::STATUS_APPROVED,
                'rating_average' => 4.8,
            ],
        );
    }
}
