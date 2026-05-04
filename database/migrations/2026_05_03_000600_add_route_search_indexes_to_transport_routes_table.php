<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transport_routes', function (Blueprint $table) {
            $table->index(['status', 'departure_at'], 'transport_routes_status_departure_index');
            $table->index('origin', 'transport_routes_origin_index');
            $table->index('destination', 'transport_routes_destination_index');
        });
    }

    public function down(): void
    {
        Schema::table('transport_routes', function (Blueprint $table) {
            $table->dropIndex('transport_routes_destination_index');
            $table->dropIndex('transport_routes_origin_index');
            $table->dropIndex('transport_routes_status_departure_index');
        });
    }
};
