<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_transporters_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '3001234567',
            'role' => Role::TRANSPORTER,
            'plate' => 'abc123',
            'vehicle_type' => 'Camion',
            'capacity_kg' => 1800,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('transporter.dashboard', absolute: false));

        $this->assertDatabaseHas('transporters', [
            'user_id' => auth()->id(),
        ]);

        $this->assertDatabaseHas('vehicles', [
            'transporter_id' => auth()->user()->transporterProfile->id,
            'plate' => 'ABC123',
            'vehicle_type' => 'Camion',
            'capacity_kg' => 1800,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);
    }

    public function test_new_producers_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Producer User',
            'email' => 'producer@example.com',
            'phone' => '3007654321',
            'role' => Role::PRODUCER,
            'farm_name' => 'Finca La Esperanza',
            'farm_location' => 'Boyaca, vereda Centro',
            'production_type' => 'Papa',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('producer.dashboard', absolute: false));

        $this->assertDatabaseHas('producers', [
            'user_id' => auth()->id(),
            'farm_name' => 'Finca La Esperanza',
            'farm_location' => 'Boyaca, vereda Centro',
            'production_type' => 'Papa',
        ]);
    }

    public function test_producers_must_provide_farm_information_when_registering(): void
    {
        $response = $this->from('/register')->post('/register', [
            'name' => 'Producer User',
            'email' => 'missing-farm@example.com',
            'phone' => '3009998888',
            'role' => Role::PRODUCER,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors(['farm_name', 'farm_location']);

        $this->assertGuest();
    }

    public function test_transporters_must_provide_vehicle_information_when_registering(): void
    {
        $response = $this->from('/register')->post('/register', [
            'name' => 'Transportista User',
            'email' => 'missing-vehicle@example.com',
            'phone' => '3001119999',
            'role' => Role::TRANSPORTER,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors(['plate', 'vehicle_type', 'capacity_kg']);

        $this->assertGuest();
    }
}
