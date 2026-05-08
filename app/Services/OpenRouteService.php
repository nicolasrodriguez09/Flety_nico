<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouteService
{
    public function getDrivingRoute(
        float $originLat,
        float $originLng,
        float $destinationLat,
        float $destinationLng
    ): ?array {
        $apiKey = config('services.openrouteservice.key');
        $baseUrl = rtrim(config('services.openrouteservice.base_url'), '/');

        if (! $apiKey) {
            Log::warning('OpenRouteService API key is not configured.');

            return null;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $apiKey,
                'Accept' => 'application/geo+json',
                'Content-Type' => 'application/json',
            ])
                ->timeout((int) config('services.openrouteservice.timeout', 30))
                ->post($baseUrl.'/v2/directions/driving-car/geojson', [
                    'coordinates' => [
                        [(float) $originLng, (float) $originLat],
                        [(float) $destinationLng, (float) $destinationLat],
                    ],
                    'instructions' => false,
                    'units' => 'km',
                ]);

            if (! $response->successful()) {
                Log::warning('OpenRouteService request failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $data = $response->json();

            $feature = $data['features'][0] ?? null;

            if (! $feature) {
                Log::warning('OpenRouteService response has no features.', [
                    'body' => $data,
                ]);

                return null;
            }

            $summary = $feature['properties']['summary'] ?? [];
            $coordinates = $feature['geometry']['coordinates'] ?? [];

            if (! $coordinates) {
                Log::warning('OpenRouteService response has no geometry coordinates.', [
                    'body' => $data,
                ]);

                return null;
            }

            return [
                'distance_km' => isset($summary['distance'])
                    ? round((float) $summary['distance'], 2)
                    : null,
                'duration_minutes' => isset($summary['duration'])
                    ? (int) ceil(((float) $summary['duration']) / 60)
                    : null,
                'geometry' => $coordinates,
            ];
        } catch (\Throwable $exception) {
            Log::warning('OpenRouteService exception.', [
                'message' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}
