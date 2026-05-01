<?php

namespace Tests\Feature;

use App\Models\Producer;
use App\Models\Role;
use App\Models\Service;
use App\Models\Transporter;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_transporter_dashboard_shows_real_route_and_request_data(): void
    {
        $user = $this->createTransporterUser();
        $vehicle = Vehicle::query()->create([
            'transporter_id' => $user->transporterProfile->id,
            'plate' => 'AAA111',
            'vehicle_type' => 'Camion',
            'capacity_kg' => 2500,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        $route = TransportRoute::query()->create([
            'transporter_id' => $user->transporterProfile->id,
            'vehicle_id' => $vehicle->id,
            'origin' => 'Tunja',
            'destination' => 'Bogota',
            'departure_at' => now()->addDays(2),
            'available_capacity_kg' => 1200,
            'permitted_cargo_type' => 'Papa',
            'status' => TransportRoute::STATUS_PUBLISHED,
        ]);

        $producer = $this->createProducerUser();

        TransportRequest::query()->create([
            'transport_route_id' => $route->id,
            'producer_id' => $producer->producerProfile->id,
            'cargo_weight_kg' => 350,
            'product_type' => 'Cafe',
            'delivery_destination' => 'Funza',
            'requested_at' => now(),
            'status' => TransportRequest::STATUS_PENDING,
        ]);

        $response = $this->actingAs($user)->get(route('transporter.dashboard'));

        $response->assertOk();
        $response->assertSee('Tunja');
        $response->assertSee('Bogota');
        $response->assertSee('Cafe');
        $response->assertSee('Vehiculos registrados');
    }

    public function test_producer_dashboard_shows_farm_information_and_available_routes(): void
    {
        $producer = $this->createProducerUser();
        $transporter = $this->createTransporterUser('available-route@example.com');
        $vehicle = Vehicle::query()->create([
            'transporter_id' => $transporter->transporterProfile->id,
            'plate' => 'BBB222',
            'vehicle_type' => 'Furgon',
            'capacity_kg' => 1800,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        TransportRoute::query()->create([
            'transporter_id' => $transporter->transporterProfile->id,
            'vehicle_id' => $vehicle->id,
            'origin' => 'Neiva',
            'destination' => 'Ibague',
            'departure_at' => now()->addDays(3),
            'available_capacity_kg' => 900,
            'permitted_cargo_type' => 'Cafe',
            'status' => TransportRoute::STATUS_PUBLISHED,
        ]);

        $response = $this->actingAs($producer)->get(route('producer.dashboard'));

        $response->assertOk();
        $response->assertSee('Finca La Esperanza');
        $response->assertSee('Boyaca, vereda Centro');
        $response->assertSee('Neiva');
        $response->assertSee('Ibague');
    }

    public function test_admin_dashboard_shows_real_platform_counts_and_pending_validations(): void
    {
        $admin = $this->createAdminUser();
        $this->createTransporterUser('pending-transport@example.com', Transporter::STATUS_PENDING, 'Transportista Pendiente');
        $approvedTransporter = $this->createTransporterUser('approved-transport@example.com');
        $this->createProducerUser('dashboard-producer@example.com');

        $vehicle = Vehicle::query()->create([
            'transporter_id' => $approvedTransporter->transporterProfile->id,
            'plate' => 'CCC333',
            'vehicle_type' => 'Camioneta',
            'brand' => 'Chevrolet',
            'model' => 'NPR',
            'model_year' => 2020,
            'capacity_kg' => 1600,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        Vehicle::query()->create([
            'transporter_id' => $approvedTransporter->transporterProfile->id,
            'plate' => 'PEN123',
            'vehicle_type' => 'Camion',
            'brand' => 'Hino',
            'model' => 'Dutro',
            'model_year' => 2021,
            'capacity_kg' => 2800,
            'vehicle_photo_path' => 'vehicle-documents/vehiculo.jpg',
            'transit_license_image_path' => 'vehicle-documents/licencia.jpg',
            'insurance_expires_at' => now()->addYear(),
            'insurance_image_path' => 'vehicle-documents/seguro.jpg',
            'technical_review_expires_at' => now()->addYear(),
            'technical_review_image_path' => 'vehicle-documents/tecnico.jpg',
            'status' => Vehicle::STATUS_PENDING,
        ]);

        $route = TransportRoute::query()->create([
            'transporter_id' => $approvedTransporter->transporterProfile->id,
            'vehicle_id' => $vehicle->id,
            'origin' => 'Sogamoso',
            'destination' => 'Bogota',
            'departure_at' => now()->addDay(),
            'available_capacity_kg' => 700,
            'permitted_cargo_type' => 'Hortalizas',
            'status' => TransportRoute::STATUS_PUBLISHED,
        ]);

        $producer = Producer::query()->firstOrFail();
        $transportRequest = TransportRequest::query()->create([
            'transport_route_id' => $route->id,
            'producer_id' => $producer->id,
            'cargo_weight_kg' => 200,
            'product_type' => 'Tomate',
            'delivery_destination' => 'Bogota',
            'requested_at' => now(),
            'status' => TransportRequest::STATUS_ACCEPTED,
        ]);

        Service::query()->create([
            'transport_request_id' => $transportRequest->id,
            'transport_route_id' => $route->id,
            'confirmed_at' => now(),
            'status' => Service::STATUS_CONFIRMED,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertSee('PEN123');
        $response->assertSee('Hino');
        $response->assertSee('Sogamoso');
        $response->assertSee('Bogota');
        $response->assertSee('Transportistas');
        $response->assertSee('Productores');
    }

    private function createTransporterUser(
        string $email = 'transporter-dashboard@example.com',
        string $validationStatus = Transporter::STATUS_APPROVED,
        string $name = 'Transportista Dashboard'
    ): User {
        $roleId = Role::query()->where('slug', Role::TRANSPORTER)->value('id');

        $user = User::factory()->create([
            'role_id' => $roleId,
            'name' => $name,
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);

        Transporter::query()->create([
            'user_id' => $user->id,
            'validation_status' => $validationStatus,
        ]);

        return $user->fresh('transporterProfile');
    }

    private function createProducerUser(string $email = 'producer-dashboard@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::PRODUCER)->value('id');

        $user = User::factory()->create([
            'role_id' => $roleId,
            'name' => 'Productor Dashboard',
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);

        Producer::query()->create([
            'user_id' => $user->id,
            'farm_name' => 'Finca La Esperanza',
            'farm_location' => 'Boyaca, vereda Centro',
            'production_type' => 'Papa',
        ]);

        return $user->fresh('producerProfile');
    }

    private function createAdminUser(string $email = 'admin-dashboard@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::ADMIN)->value('id');

        return User::factory()->create([
            'role_id' => $roleId,
            'name' => 'Admin Dashboard',
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);
    }
}
