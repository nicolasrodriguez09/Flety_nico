<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transport_routes', function (Blueprint $table) {
            $table->decimal('origin_lat', 10, 7)->nullable()->after('origin');
            $table->decimal('origin_lng', 10, 7)->nullable()->after('origin_lat');

            $table->decimal('destination_lat', 10, 7)->nullable()->after('destination');
            $table->decimal('destination_lng', 10, 7)->nullable()->after('destination_lat');

            $table->decimal('distance_km', 10, 2)->nullable()->after('available_capacity_kg');
            $table->unsignedInteger('estimated_duration_minutes')->nullable()->after('distance_km');
        });
    }

    public function down(): void
    {
        Schema::table('transport_routes', function (Blueprint $table) {
            $table->dropColumn([
                'origin_lat',
                'origin_lng',
                'destination_lat',
                'destination_lng',
                'distance_km',
                'estimated_duration_minutes',
            ]);
        });
    }
};