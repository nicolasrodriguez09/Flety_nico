<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transporters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('identity_document', 50)->nullable()->unique();
            $table->string('driver_license', 50)->nullable()->unique();
            $table->string('validation_status', 30)->default('pending')->index();
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('producers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('farm_name')->nullable();
            $table->string('farm_location')->nullable();
            $table->string('production_type')->nullable();
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transporter_id')->constrained()->cascadeOnDelete();
            $table->string('plate', 20)->unique();
            $table->string('vehicle_type', 50);
            $table->decimal('capacity_kg', 10, 2);
            $table->string('status', 30)->default('available')->index();
            $table->timestamps();
        });

        Schema::create('transport_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transporter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->string('origin');
            $table->string('destination');
            $table->dateTime('departure_at')->index();
            $table->decimal('available_capacity_kg', 10, 2);
            $table->string('permitted_cargo_type', 100);
            $table->string('status', 30)->default('published')->index();
            $table->timestamps();
        });

        Schema::create('transport_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_route_id')->constrained()->cascadeOnDelete();
            $table->foreignId('producer_id')->constrained()->cascadeOnDelete();
            $table->decimal('cargo_weight_kg', 10, 2);
            $table->string('product_type', 100);
            $table->string('delivery_destination');
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->string('status', 30)->default('pending')->index();
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_request_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('transport_route_id')->constrained()->cascadeOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->string('status', 30)->default('pending')->index();
            $table->string('agreed_payment_method', 50)->nullable();
            $table->decimal('agreed_amount', 12, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('service_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->unique()->constrained('services')->cascadeOnDelete();
            $table->string('shared_phone', 20)->nullable();
            $table->string('shared_whatsapp', 20)->nullable();
            $table->timestamp('enabled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('document_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transporter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('validated_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('document_type', 100);
            $table->string('file_path');
            $table->string('review_status', 30)->default('pending')->index();
            $table->text('review_notes')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('entity_type', 100);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->text('details')->nullable();
            $table->timestamp('event_at')->useCurrent()->index();
            $table->timestamps();
        });

        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('author_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->text('comment')->nullable();
            $table->timestamp('rated_at')->useCurrent();
            $table->timestamps();

            $table->unique(['service_id', 'author_user_id', 'recipient_user_id'], 'ratings_service_author_recipient_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
        Schema::dropIfExists('admin_activity_logs');
        Schema::dropIfExists('document_verifications');
        Schema::dropIfExists('service_contacts');
        Schema::dropIfExists('services');
        Schema::dropIfExists('transport_requests');
        Schema::dropIfExists('transport_routes');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('producers');
        Schema::dropIfExists('transporters');
    }
};
