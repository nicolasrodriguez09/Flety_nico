<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $timestamp = now();

        Role::query()->upsert([
            [
                'name' => 'Transportista',
                'slug' => Role::TRANSPORTER,
                'description' => 'Usuario que publica rutas y transporta carga.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'name' => 'Productor',
                'slug' => Role::PRODUCER,
                'description' => 'Usuario que solicita transporte para su carga.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'name' => 'Administrador',
                'slug' => Role::ADMIN,
                'description' => 'Usuario interno encargado de validar y monitorear la plataforma.',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ], ['slug'], ['name', 'description', 'updated_at']);
    }
}
