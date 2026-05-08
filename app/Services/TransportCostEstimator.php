<?php

namespace App\Services;

class TransportCostEstimator
{
    private const BASE_FARE = 45000;

    private const PRICE_PER_KM = 1800;

    private const PRICE_PER_KG = 65;

    private const PRICE_PER_TON_KM = 420;

    public function estimate(float|int|string|null $distanceKm, float|int|string|null $cargoWeightKg): ?float
    {
        if ($distanceKm === null || $distanceKm === '' || $cargoWeightKg === null || $cargoWeightKg === '') {
            return null;
        }

        $distanceKm = (float) $distanceKm;
        $cargoWeightKg = (float) $cargoWeightKg;

        if ($distanceKm <= 0 || $cargoWeightKg <= 0) {
            return null;
        }

        $estimatedCost =
            self::BASE_FARE +
            ($distanceKm * self::PRICE_PER_KM) +
            ($cargoWeightKg * self::PRICE_PER_KG) +
            (($cargoWeightKg / 1000) * $distanceKm * self::PRICE_PER_TON_KM);

        return (float) (ceil($estimatedCost / 1000) * 1000);
    }
}
