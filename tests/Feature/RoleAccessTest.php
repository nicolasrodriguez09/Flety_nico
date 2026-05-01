<?php

namespace Tests\Feature;

use App\Models\Producer;
use App\Models\Role;
use App\Models\Transporter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_redirects_transporters_to_their_panel(): void
    {
        $user = $this->createTransporterUser();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('transporter.dashboard'));
    }

    public function test_dashboard_redirects_producers_to_their_panel(): void
    {
        $user = $this->createProducerUser();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('producer.dashboard'));
    }

    public function test_dashboard_redirects_admins_to_their_panel(): void
    {
        $user = $this->createAdminUser();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_admin_can_open_transporter_validation_module(): void
    {
        $user = $this->createAdminUser();

        $this->actingAs($user)
            ->get(route('admin.transporters.index'))
            ->assertOk();
    }

    public function test_generic_routes_url_redirects_transporters_and_producers_to_their_role_area(): void
    {
        $transporter = $this->createTransporterUser();
        $producer = $this->createProducerUser('producer-routes@example.com');

        $this->actingAs($transporter)
            ->get(route('routes.index'))
            ->assertRedirect(route('transporter.routes.index'));

        auth()->logout();

        $this->actingAs($producer)
            ->get(route('routes.index'))
            ->assertRedirect(route('producer.routes.index'));
    }

    public function test_transporter_can_open_vehicle_registration_area(): void
    {
        $user = $this->createTransporterUser();

        $this->actingAs($user)
            ->get(route('transporter.vehicles.create'))
            ->assertOk();
    }

    public function test_transporter_cannot_access_producer_routes(): void
    {
        $user = $this->createTransporterUser();

        $this->actingAs($user)
            ->get(route('producer.routes.index'))
            ->assertForbidden();
    }

    public function test_producer_cannot_access_transporter_routes(): void
    {
        $user = $this->createProducerUser();

        $this->actingAs($user)
            ->get(route('transporter.routes.index'))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('transporter.vehicles.create'))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('admin.transporters.index'))
            ->assertForbidden();
    }

    public function test_admin_cannot_access_transporter_or_producer_route_areas(): void
    {
        $user = $this->createAdminUser();

        $this->actingAs($user)
            ->get(route('transporter.routes.index'))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('producer.routes.index'))
            ->assertForbidden();
    }

    private function createTransporterUser(string $email = 'transporter-role@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::TRANSPORTER)->value('id');

        $user = User::factory()->create([
            'role_id' => $roleId,
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);

        Transporter::query()->create([
            'user_id' => $user->id,
            'validation_status' => Transporter::STATUS_PENDING,
        ]);

        return $user;
    }

    private function createProducerUser(string $email = 'producer-role@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::PRODUCER)->value('id');

        $user = User::factory()->create([
            'role_id' => $roleId,
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);

        Producer::query()->create([
            'user_id' => $user->id,
        ]);

        return $user;
    }

    private function createAdminUser(string $email = 'admin-role@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::ADMIN)->value('id');

        return User::factory()->create([
            'role_id' => $roleId,
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);
    }
}
