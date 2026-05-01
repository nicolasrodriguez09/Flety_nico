<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isTransporter() ?? false;
    }

    /**
     * @return array<string, array<int, ValidationRule|string>>
     */
    public function rules(): array
    {
        $maxYear = now()->addYear()->year;

        return [
            'plate' => ['required', 'string', 'max:20', Rule::unique('vehicles', 'plate')],
            'vehicle_type' => ['required', 'string', 'max:50'],
            'brand' => ['required', 'string', 'max:80'],
            'model' => ['required', 'string', 'max:80'],
            'model_year' => ['required', 'integer', 'min:1950', 'max:'.$maxYear],
            'color' => ['nullable', 'string', 'max:50'],
            'capacity_kg' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'vehicle_photo' => ['required', 'image', 'max:4096'],
            'transit_license_image' => ['required', 'image', 'max:4096'],
            'insurance_expires_at' => ['required', 'date', 'after_or_equal:today'],
            'insurance_image' => ['required', 'image', 'max:4096'],
            'technical_review_expires_at' => ['required', 'date', 'after_or_equal:today'],
            'technical_review_image' => ['required', 'image', 'max:4096'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'plate' => strtoupper(trim((string) $this->input('plate'))),
            'vehicle_type' => trim((string) $this->input('vehicle_type')),
            'brand' => trim((string) $this->input('brand')),
            'model' => trim((string) $this->input('model')),
            'color' => $this->filled('color') ? trim((string) $this->input('color')) : null,
        ]);
    }
}
