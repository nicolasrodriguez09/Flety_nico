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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TransportRouteManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_validated_transporter_can_register_a_vehicle_and_publish_a_route(): void
    {
        Storage::fake('public');
        $user = $this->createTransporterUser(Transporter::STATUS_APPROVED);

        $this->actingAs($user)
            ->post(route('transporter.vehicles.store'), $this->validVehiclePayload([
                'plate' => 'abc123',
                'vehicle_type' => 'Camion',
                'capacity_kg' => 2500,
            ]))
            ->assertRedirect();

        $vehicle = Vehicle::query()->firstOrFail();

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'plate' => 'ABC123',
            'transporter_id' => $user->transporterProfile->id,
            'status' => Vehicle::STATUS_PENDING,
        ]);

        $this->actingAs($this->createAdminUser())
            ->post(route('admin.vehicles.approve', $vehicle))
            ->assertRedirect();

        $this->actingAs($user)
            ->post(route('transporter.routes.store'), [
                'vehicle_id' => $vehicle->id,
                'origin' => 'Tunja',
                'destination' => 'Bogota',
                'departure_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
                'available_capacity_kg' => 1800,
                'permitted_cargo_type' => 'Papa',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'plate' => 'ABC123',
            'transporter_id' => $user->transporterProfile->id,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        $this->assertDatabaseHas('transport_routes', [
            'transporter_id' => $user->transporterProfile->id,
            'vehicle_id' => $vehicle->id,
            'origin' => 'Tunja',
            'destination' => 'Bogota',
            'status' => TransportRoute::STATUS_PUBLISHED,
        ]);
    }

    public function test_registered_vehicle_stays_pending_and_cannot_publish_routes_until_admin_approval(): void
    {
        Storage::fake('public');
        $user = $this->createTransporterUser(Transporter::STATUS_APPROVED);

        $this->actingAs($user)
            ->post(route('transporter.vehicles.store'), $this->validVehiclePayload([
                'plate' => 'pnd123',
                'capacity_kg' => 1800,
            ]))
            ->assertRedirect();

        $vehicle = Vehicle::query()->firstOrFail();

        $this->assertSame(Vehicle::STATUS_PENDING, $vehicle->status);

        $this->actingAs($user)
            ->from(route('transporter.routes.index'))
            ->post(route('transporter.routes.store'), [
                'vehicle_id' => $vehicle->id,
                'origin' => 'Neiva',
                'destination' => 'Ibague',
                'departure_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
                'available_capacity_kg' => 1000,
                'permitted_cargo_type' => 'Cafe',
            ])
            ->assertRedirect(route('transporter.routes.index'))
            ->assertSessionHasErrors(['vehicle_id']);

        $this->assertDatabaseCount('transport_routes', 0);
    }

    public function test_route_publication_requires_origin_destination_departure_date_and_available_capacity(): void
    {
        $user = $this->createTransporterUser(Transporter::STATUS_APPROVED);
        $vehicle = Vehicle::query()->create([
            'transporter_id' => $user->transporterProfile->id,
            'plate' => 'REQ123',
            'vehicle_type' => 'Camion',
            'capacity_kg' => 2500,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        $this->actingAs($user)
            ->from(route('transporter.routes.index'))
            ->post(route('transporter.routes.store'), [
                'vehicle_id' => $vehicle->id,
                'origin' => '',
                'destination' => '',
                'departure_at' => '',
                'available_capacity_kg' => '',
                'permitted_cargo_type' => 'Papa',
            ])
            ->assertRedirect(route('transporter.routes.index'))
            ->assertSessionHasErrors([
                'origin',
                'destination',
                'departure_at',
                'available_capacity_kg',
            ]);

        $this->assertDatabaseCount('transport_routes', 0);
    }

    public function test_route_publication_trims_location_and_cargo_type_values_before_saving(): void
    {
        $user = $this->createTransporterUser(Transporter::STATUS_APPROVED);
        $vehicle = Vehicle::query()->create([
            'transporter_id' => $user->transporterProfile->id,
            'plate' => 'TRM123',
            'vehicle_type' => 'Camion',
            'capacity_kg' => 2500,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        $this->actingAs($user)
            ->post(route('transporter.routes.store'), [
                'vehicle_id' => $vehicle->id,
                'origin' => '  Neiva  ',
                'destination' => '  Ibague  ',
                'departure_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
                'available_capacity_kg' => 1800,
                'permitted_cargo_type' => '  Cafe  ',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('transport_routes', [
            'transporter_id' => $user->transporterProfile->id,
            'vehicle_id' => $vehicle->id,
            'origin' => 'Neiva',
            'destination' => 'Ibague',
            'permitted_cargo_type' => 'Cafe',
            'status' => TransportRoute::STATUS_PUBLISHED,
        ]);
    }

    public function test_pending_transporter_cannot_publish_routes(): void
    {
        $user = $this->createTransporterUser(Transporter::STATUS_PENDING);
        $vehicle = Vehicle::query()->create([
            'transporter_id' => $user->transporterProfile->id,
            'plate' => 'ZZZ999',
            'vehicle_type' => 'Camioneta',
            'capacity_kg' => 1200,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        $this->actingAs($user)
            ->from(route('transporter.routes.index'))
            ->post(route('transporter.routes.store'), [
                'vehicle_id' => $vehicle->id,
                'origin' => 'Yopal',
                'destination' => 'Sogamoso',
                'departure_at' => now()->addDay()->format('Y-m-d H:i:s'),
                'available_capacity_kg' => 1000,
                'permitted_cargo_type' => 'Insumos',
            ])
            ->assertRedirect(route('transporter.routes.index'));

        $this->assertDatabaseCount('transport_routes', 0);
    }

    public function test_producer_can_create_a_transport_request_for_a_published_route(): void
    {
        $route = $this->createPublishedRoute();
        $producer = $this->createProducerUser();

        $this->actingAs($producer)
            ->post(route('producer.transport-requests.store'), [
                'transport_route_id' => $route->id,
                'cargo_weight_kg' => 450,
                'product_type' => 'Cafe',
                'delivery_destination' => 'Mosquera',
                'estimated_cost' => 180000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('transport_requests', [
            'transport_route_id' => $route->id,
            'producer_id' => $producer->producerProfile->id,
            'product_type' => 'Cafe',
            'status' => TransportRequest::STATUS_PENDING,
        ]);
    }

    public function test_producer_cannot_request_more_weight_than_available_capacity(): void
    {
        $route = $this->createPublishedRoute([
            'available_capacity_kg' => 400,
        ]);
        $producer = $this->createProducerUser();

        $this->actingAs($producer)
            ->from(route('producer.routes.index'))
            ->post(route('producer.transport-requests.store'), [
                'transport_route_id' => $route->id,
                'cargo_weight_kg' => 550,
                'product_type' => 'Platano',
                'delivery_destination' => 'Funza',
            ])
            ->assertRedirect(route('producer.routes.index'));

        $this->assertDatabaseCount('transport_requests', 0);
    }

    public function test_route_index_only_exposes_future_routes_from_validated_transporters(): void
    {
        $visibleRoute = $this->createPublishedRoute([
            'origin' => 'Visible Origin',
            'destination' => 'Visible Destination',
        ]);

        $hiddenPendingTransporter = $this->createTransporterUser(Transporter::STATUS_PENDING, 'pending@example.com');
        $hiddenVehicle = Vehicle::query()->create([
            'transporter_id' => $hiddenPendingTransporter->transporterProfile->id,
            'plate' => 'HID321',
            'vehicle_type' => 'Camion',
            'capacity_kg' => 3000,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        TransportRoute::query()->create([
            'transporter_id' => $hiddenPendingTransporter->transporterProfile->id,
            'vehicle_id' => $hiddenVehicle->id,
            'origin' => 'Hidden Pending',
            'destination' => 'Hidden Pending Destination',
            'departure_at' => now()->addDays(3),
            'available_capacity_kg' => 600,
            'permitted_cargo_type' => 'Yuca',
            'status' => TransportRoute::STATUS_PUBLISHED,
        ]);

        $pastRoute = $this->createPublishedRoute([
            'origin' => 'Hidden Past',
            'destination' => 'Hidden Past Destination',
            'departure_at' => Carbon::now()->subDay(),
        ], 'past@example.com');

        $producer = $this->createProducerUser('viewer@example.com');

        $response = $this->actingAs($producer)->get(route('producer.routes.index'));

        $response->assertOk();
        $response->assertSee($visibleRoute->origin);
        $response->assertSee($visibleRoute->destination);
        $response->assertDontSee('Hidden Pending');
        $response->assertDontSee($pastRoute->origin);
    }

    public function test_producer_cannot_see_transporter_contact_before_request_is_accepted(): void
    {
        $route = $this->createPublishedRoute();
        $route->load('transporter.user');
        $route->transporter->user->update(['phone' => '3005556677']);

        $producer = $this->createProducerUser('privacy@example.com');

        $response = $this->actingAs($producer)->get(route('producer.routes.index'));

        $response->assertOk();
        $response->assertDontSee('3005556677');
        $response->assertDontSee('wa.me/573005556677');
    }

    public function test_transporter_can_accept_request_and_enable_contact_for_involved_parties_only(): void
    {
        $route = $this->createPublishedRoute([
            'available_capacity_kg' => 900,
        ], 'contact-route@example.com');
        $route->load('transporter.user');
        $route->transporter->user->update(['phone' => '3001112233']);

        $producer = $this->createProducerUser('contact-producer@example.com');
        $producer->producerProfile->user->update(['phone' => '3002223344']);

        $transportRequest = TransportRequest::query()->create([
            'transport_route_id' => $route->id,
            'producer_id' => $producer->producerProfile->id,
            'cargo_weight_kg' => 400,
            'product_type' => 'Cafe',
            'delivery_destination' => 'Tunja',
            'estimated_cost' => 210000,
            'requested_at' => now(),
            'status' => TransportRequest::STATUS_PENDING,
        ]);

        $transporterUser = $route->transporter->user;

        $this->actingAs($transporterUser)
            ->post(route('transporter.transport-requests.accept', $transportRequest))
            ->assertRedirect();

        $service = Service::query()->where('transport_request_id', $transportRequest->id)->first();

        $this->assertNotNull($service);

        $this->assertDatabaseHas('transport_requests', [
            'id' => $transportRequest->id,
            'status' => TransportRequest::STATUS_ACCEPTED,
        ]);

        $this->assertDatabaseHas('transport_routes', [
            'id' => $route->id,
            'available_capacity_kg' => 500,
        ]);

        $this->assertDatabaseHas('services', [
            'id' => $service->id,
            'status' => Service::STATUS_CONFIRMED,
        ]);

        $this->assertDatabaseHas('service_contacts', [
            'service_id' => $service->id,
            'shared_phone' => '3001112233',
            'shared_whatsapp' => '573001112233',
        ]);

        $producerResponse = $this->actingAs($producer->fresh())
            ->get(route('producer.routes.index'));

        $producerResponse->assertOk();
        $producerResponse->assertSee('3001112233');
        $producerResponse->assertSee('573001112233');

        $transporterResponse = $this->actingAs($transporterUser->fresh())
            ->get(route('transporter.routes.index'));

        $transporterResponse->assertOk();
        $transporterResponse->assertSee('3002223344');
        $transporterResponse->assertSee('573002223344');

        $otherProducer = $this->createProducerUser('other-party@example.com');

        $otherProducerResponse = $this->actingAs($otherProducer)
            ->get(route('producer.routes.index'));

        $otherProducerResponse->assertOk();
        $otherProducerResponse->assertDontSee('3001112233');
        $otherProducerResponse->assertDontSee('3002223344');
    }

    public function test_only_route_owner_can_accept_a_request(): void
    {
        $route = $this->createPublishedRoute([], 'owner-route@example.com');
        $producer = $this->createProducerUser('locked-producer@example.com');

        $transportRequest = TransportRequest::query()->create([
            'transport_route_id' => $route->id,
            'producer_id' => $producer->producerProfile->id,
            'cargo_weight_kg' => 300,
            'product_type' => 'Papa',
            'delivery_destination' => 'Bogota',
            'requested_at' => now(),
            'status' => TransportRequest::STATUS_PENDING,
        ]);

        $otherTransporter = $this->createTransporterUser(
            Transporter::STATUS_APPROVED,
            'other-transporter@example.com',
        );

        $this->actingAs($otherTransporter)
            ->post(route('transporter.transport-requests.accept', $transportRequest))
            ->assertForbidden();

        $this->assertDatabaseHas('transport_requests', [
            'id' => $transportRequest->id,
            'status' => TransportRequest::STATUS_PENDING,
        ]);

        $this->assertDatabaseCount('services', 0);
        $this->assertDatabaseCount('service_contacts', 0);
    }

    private function createTransporterUser(string $validationStatus, string $email = 'transporter@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::TRANSPORTER)->value('id');

        $user = User::factory()->create([
            'role_id' => $roleId,
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);

        Transporter::query()->create([
            'user_id' => $user->id,
            'identity_document' => fake()->unique()->numerify('##########'),
            'driver_license' => fake()->unique()->bothify('LIC#####'),
            'validation_status' => $validationStatus,
            'rating_average' => 0,
        ]);

        return $user->fresh('transporterProfile');
    }

    private function createProducerUser(string $email = 'producer@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::PRODUCER)->value('id');

        $user = User::factory()->create([
            'role_id' => $roleId,
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);

        Producer::query()->create([
            'user_id' => $user->id,
            'farm_name' => 'Finca La Esperanza',
            'farm_location' => 'Boyaca',
            'production_type' => 'Tuberculos',
            'rating_average' => 0,
        ]);

        return $user->fresh('producerProfile');
    }

    private function createAdminUser(string $email = 'admin-routes@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::ADMIN)->value('id');

        return User::factory()->create([
            'role_id' => $roleId,
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createPublishedRoute(array $attributes = [], string $transporterEmail = 'approved-route@example.com'): TransportRoute
    {
        $user = $this->createTransporterUser(Transporter::STATUS_APPROVED, $transporterEmail);
        $vehicle = Vehicle::query()->create([
            'transporter_id' => $user->transporterProfile->id,
            'plate' => strtoupper(fake()->unique()->bothify('???###')),
            'vehicle_type' => 'Camion',
            'capacity_kg' => 3000,
            'status' => Vehicle::STATUS_AVAILABLE,
        ]);

        return TransportRoute::query()->create(array_merge([
            'transporter_id' => $user->transporterProfile->id,
            'vehicle_id' => $vehicle->id,
            'origin' => 'Duitama',
            'destination' => 'Bogota',
            'departure_at' => now()->addDays(4),
            'available_capacity_kg' => 900,
            'permitted_cargo_type' => 'Papa',
            'status' => TransportRoute::STATUS_PUBLISHED,
        ], $attributes));
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validVehiclePayload(array $overrides = []): array
    {
        return array_merge([
            'plate' => strtoupper(fake()->unique()->bothify('???###')),
            'vehicle_type' => 'Camion',
            'brand' => 'Chevrolet',
            'model' => 'NPR',
            'model_year' => 2020,
            'color' => 'Blanco',
            'capacity_kg' => 2500,
            'vehicle_photo' => UploadedFile::fake()->create('vehiculo.jpg', 100, 'image/jpeg'),
            'transit_license_image' => UploadedFile::fake()->create('licencia.jpg', 100, 'image/jpeg'),
            'insurance_expires_at' => now()->addYear()->format('Y-m-d'),
            'insurance_image' => UploadedFile::fake()->create('seguro.jpg', 100, 'image/jpeg'),
            'technical_review_expires_at' => now()->addYear()->format('Y-m-d'),
            'technical_review_image' => UploadedFile::fake()->create('tecnico.jpg', 100, 'image/jpeg'),
        ], $overrides);
    }
}
