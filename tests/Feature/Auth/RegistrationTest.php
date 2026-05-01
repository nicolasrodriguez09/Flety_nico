<?php

namespace Tests\Feature\Auth;

use App\Models\DocumentVerification;
use App\Models\Role;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        Storage::fake('public');
        Storage::fake('local');

        $response = $this->post('/register', array_merge($this->validVehiclePayload(), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '3001234567',
            'role' => Role::TRANSPORTER,
            'identity_document' => '1045123456',
            'driver_license' => 'LIC123456',
            'plate' => 'abc123',
            'vehicle_type' => 'Camion',
            'capacity_kg' => 1800,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]));

        $this->assertAuthenticated();
        $response->assertRedirect(route('transporter.dashboard', absolute: false));

        $this->assertDatabaseHas('transporters', [
            'user_id' => auth()->id(),
            'identity_document' => '1045123456',
            'driver_license' => 'LIC123456',
        ]);

        $this->assertDatabaseHas('document_verifications', [
            'transporter_id' => auth()->user()->transporterProfile->id,
            'document_type' => DocumentVerification::TYPE_IDENTITY_DOCUMENT,
            'review_status' => DocumentVerification::STATUS_PENDING,
        ]);

        $this->assertDatabaseHas('document_verifications', [
            'transporter_id' => auth()->user()->transporterProfile->id,
            'document_type' => DocumentVerification::TYPE_DRIVER_LICENSE,
            'review_status' => DocumentVerification::STATUS_PENDING,
        ]);

        $this->assertDatabaseHas('vehicles', [
            'transporter_id' => auth()->user()->transporterProfile->id,
            'plate' => 'ABC123',
            'vehicle_type' => 'Camion',
            'brand' => 'Chevrolet',
            'model' => 'NPR',
            'model_year' => 2020,
            'capacity_kg' => 1800,
            'status' => Vehicle::STATUS_PENDING,
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
        $response->assertSessionHasErrors([
            'plate',
            'vehicle_type',
            'identity_document',
            'driver_license',
            'identity_document_image',
            'driver_license_image',
            'brand',
            'model',
            'model_year',
            'capacity_kg',
            'vehicle_photo',
            'transit_license_image',
            'insurance_expires_at',
            'insurance_image',
            'technical_review_expires_at',
            'technical_review_image',
        ]);

        $this->assertGuest();
    }

    /**
     * @return array<string, mixed>
     */
    private function validVehiclePayload(): array
    {
        return [
            'brand' => 'Chevrolet',
            'model' => 'NPR',
            'model_year' => 2020,
            'color' => 'Blanco',
            'identity_document_image' => UploadedFile::fake()->create('cedula.jpg', 100, 'image/jpeg'),
            'driver_license_image' => UploadedFile::fake()->create('licencia-conduccion.jpg', 100, 'image/jpeg'),
            'vehicle_photo' => UploadedFile::fake()->create('vehiculo.jpg', 100, 'image/jpeg'),
            'transit_license_image' => UploadedFile::fake()->create('licencia.jpg', 100, 'image/jpeg'),
            'insurance_expires_at' => now()->addYear()->format('Y-m-d'),
            'insurance_image' => UploadedFile::fake()->create('seguro.jpg', 100, 'image/jpeg'),
            'technical_review_expires_at' => now()->addYear()->format('Y-m-d'),
            'technical_review_image' => UploadedFile::fake()->create('tecnico.jpg', 100, 'image/jpeg'),
        ];
    }
}
