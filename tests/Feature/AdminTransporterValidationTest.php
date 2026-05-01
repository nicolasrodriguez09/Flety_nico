<?php

namespace Tests\Feature;

use App\Models\DocumentVerification;
use App\Models\Role;
use App\Models\Transporter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminTransporterValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_validate_a_transporter_and_mark_documents_as_approved(): void
    {
        Storage::fake('local');

        $admin = $this->createAdminUser();
        $transporterUser = $this->createTransporterUser();
        $transporter = $transporterUser->transporterProfile;

        Storage::disk('local')->put('transporter-documents/identity.jpg', 'identity');
        Storage::disk('local')->put('transporter-documents/license.jpg', 'license');

        DocumentVerification::query()->create([
            'transporter_id' => $transporter->id,
            'document_type' => DocumentVerification::TYPE_IDENTITY_DOCUMENT,
            'file_path' => 'transporter-documents/identity.jpg',
            'review_status' => DocumentVerification::STATUS_PENDING,
            'uploaded_at' => now(),
        ]);

        DocumentVerification::query()->create([
            'transporter_id' => $transporter->id,
            'document_type' => DocumentVerification::TYPE_DRIVER_LICENSE,
            'file_path' => 'transporter-documents/license.jpg',
            'review_status' => DocumentVerification::STATUS_PENDING,
            'uploaded_at' => now(),
        ]);

        $dashboard = $this->actingAs($admin)->get(route('admin.transporters.index'));

        $dashboard->assertOk();
        $dashboard->assertSee('Transportista Validacion');
        $dashboard->assertSee('Documento de identidad');
        $dashboard->assertSee('Licencia de conduccion');

        $this->actingAs($admin)
            ->post(route('admin.transporters.approve', $transporter))
            ->assertRedirect();

        $this->assertDatabaseHas('transporters', [
            'id' => $transporter->id,
            'validation_status' => Transporter::STATUS_APPROVED,
        ]);

        $this->assertDatabaseMissing('document_verifications', [
            'transporter_id' => $transporter->id,
            'review_status' => DocumentVerification::STATUS_PENDING,
        ]);

        $this->assertDatabaseHas('document_verifications', [
            'transporter_id' => $transporter->id,
            'review_status' => DocumentVerification::STATUS_APPROVED,
            'validated_by_admin_id' => $admin->id,
        ]);
    }

    public function test_admin_can_reject_a_transporter(): void
    {
        $admin = $this->createAdminUser('admin-reject@example.com');
        $transporterUser = $this->createTransporterUser('reject@example.com');
        $transporter = $transporterUser->transporterProfile;

        $this->actingAs($admin)
            ->post(route('admin.transporters.reject', $transporter))
            ->assertRedirect();

        $this->assertDatabaseHas('transporters', [
            'id' => $transporter->id,
            'validation_status' => Transporter::STATUS_REJECTED,
        ]);
    }

    public function test_non_admin_cannot_open_transporter_documents(): void
    {
        Storage::fake('local');

        $transporterUser = $this->createTransporterUser('document-owner@example.com');
        $document = DocumentVerification::query()->create([
            'transporter_id' => $transporterUser->transporterProfile->id,
            'document_type' => DocumentVerification::TYPE_IDENTITY_DOCUMENT,
            'file_path' => 'transporter-documents/identity.jpg',
            'review_status' => DocumentVerification::STATUS_PENDING,
            'uploaded_at' => now(),
        ]);

        Storage::disk('local')->put($document->file_path, 'identity');

        $this->actingAs($transporterUser)
            ->get(route('admin.transporter-documents.show', $document))
            ->assertForbidden();
    }

    private function createAdminUser(string $email = 'admin-validation@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::ADMIN)->value('id');

        return User::factory()->create([
            'role_id' => $roleId,
            'name' => 'Admin Validacion',
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);
    }

    private function createTransporterUser(string $email = 'transporter-validation@example.com'): User
    {
        $roleId = Role::query()->where('slug', Role::TRANSPORTER)->value('id');

        $user = User::factory()->create([
            'role_id' => $roleId,
            'name' => 'Transportista Validacion',
            'email' => $email,
            'phone' => fake()->unique()->numerify('3#########'),
        ]);

        Transporter::query()->create([
            'user_id' => $user->id,
            'identity_document' => fake()->unique()->numerify('##########'),
            'driver_license' => fake()->unique()->bothify('LIC#####'),
            'validation_status' => Transporter::STATUS_PENDING,
        ]);

        return $user->fresh('transporterProfile');
    }
}
