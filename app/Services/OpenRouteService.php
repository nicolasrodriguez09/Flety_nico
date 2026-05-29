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

        // Intentar con OpenRouteService primero
        if ($apiKey) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => $apiKey,
                    'Accept' => 'application/geo+json',
                    'Content-Type' => 'application/json',
                ])
                    ->timeout(10)
                    ->post($baseUrl.'/v2/directions/driving-car/geojson', [
                        'coordinates' => [
                            [(float) $originLng, (float) $originLat],
                            [(float) $destinationLng, (float) $destinationLat],
                        ],
                        'instructions' => false,
                        'units' => 'km',
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $feature = $data['features'][0] ?? null;

                    if ($feature) {
                        $summary = $feature['properties']['summary'] ?? [];
                        $coordinates = $feature['geometry']['coordinates'] ?? [];

                        if ($coordinates) {
                            return [
                                'distance_km' => isset($summary['distance']) ? round((float) $summary['distance'], 2) : null,
                                'duration_minutes' => isset($summary['duration']) ? (int) ceil(((float) $summary['duration']) / 60) : null,
                                'geometry' => $coordinates,
                            ];
                        }
                    }
                } else {
                    Log::warning('OpenRouteService request failed.', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $exception) {
                Log::warning('OpenRouteService exception.', [
                    'message' => $exception->getMessage(),
                ]);
            }
        }

        // Fallback a OSRM publico si ORS falla o no tiene API key
        try {
            $osrmUrl = "https://router.project-osrm.org/route/v1/driving/{$originLng},{$originLat};{$destinationLng},{$destinationLat}?geometries=geojson&overview=full";
            $response = Http::timeout(10)->get($osrmUrl);

            if ($response->successful()) {
                $data = $response->json();
                $route = $data['routes'][0] ?? null;

                if ($route && isset($route['geometry']['coordinates'])) {
                    return [
                        'distance_km' => isset($route['distance']) ? round((float) $route['distance'] / 1000, 2) : null,
                        'duration_minutes' => isset($route['duration']) ? (int) ceil(((float) $route['duration']) / 60) : null,
                        'geometry' => $route['geometry']['coordinates'],
                    ];
                }
            } else {
                Log::warning('OSRM fallback request failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $exception) {
            Log::warning('OSRM fallback exception.', [
                'message' => $exception->getMessage(),
            ]);
        }

        return null;
    }
}
