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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('brand', 80)->nullable()->after('vehicle_type');
            $table->string('model', 80)->nullable()->after('brand');
            $table->unsignedSmallInteger('model_year')->nullable()->after('model');
            $table->string('color', 50)->nullable()->after('model_year');
            $table->string('vehicle_photo_path')->nullable()->after('capacity_kg');
            $table->string('transit_license_image_path')->nullable()->after('vehicle_photo_path');
            $table->date('insurance_expires_at')->nullable()->after('transit_license_image_path');
            $table->string('insurance_image_path')->nullable()->after('insurance_expires_at');
            $table->date('technical_review_expires_at')->nullable()->after('insurance_image_path');
            $table->string('technical_review_image_path')->nullable()->after('technical_review_expires_at');
            $table->foreignId('reviewed_by_admin_id')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by_admin_id');
            $table->text('review_notes')->nullable()->after('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by_admin_id']);
            $table->dropColumn([
                'brand',
                'model',
                'model_year',
                'color',
                'vehicle_photo_path',
                'transit_license_image_path',
                'insurance_expires_at',
                'insurance_image_path',
                'technical_review_expires_at',
                'technical_review_image_path',
                'reviewed_by_admin_id',
                'reviewed_at',
                'review_notes',
            ]);
        });
    }
};
