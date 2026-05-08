<?php

namespace App\Http\Requests;

use App\Models\Transporter;
use App\Models\Vehicle;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTransportRouteRequest extends FormRequest
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
        $transporterId = $this->user()?->transporterProfile?->id;

        return [
            'vehicle_id' => [
                'required',
                'integer',
                Rule::exists('vehicles', 'id')->where(function ($query) use ($transporterId) {
                    $query
                        ->where('transporter_id', $transporterId)
                        ->where('status', Vehicle::STATUS_AVAILABLE);
                }),
            ],
            'origin' => ['required', 'string', 'max:255'],
            'origin_lat' => ['required', 'numeric', 'between:-4.5,13.8'],
            'origin_lng' => ['required', 'numeric', 'between:-82.2,-66.7'],

            'destination' => ['required', 'string', 'max:255', 'different:origin'],
            'destination_lat' => ['required', 'numeric', 'between:-4.5,13.8'],
            'destination_lng' => ['required', 'numeric', 'between:-82.2,-66.7'],

            'departure_at' => ['required', 'date', 'after:now'],
            'available_capacity_kg' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'permitted_cargo_type' => ['required', 'string', 'max:100'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $transporter = $this->user()?->transporterProfile;

            if (! $transporter instanceof Transporter) {
                $validator->errors()->add('vehicle_id', 'El perfil de transportista no existe.');

                return;
            }

            if (! $transporter->isValidated()) {
                $validator->errors()->add('vehicle_id', 'Solo los transportistas validados pueden publicar rutas.');
            }

            $vehicle = $transporter->vehicles()->find($this->integer('vehicle_id'));

            if ($vehicle && (float) $this->input('available_capacity_kg') > (float) $vehicle->capacity_kg) {
                $validator->errors()->add('available_capacity_kg', 'La capacidad disponible no puede superar la capacidad del vehículo.');
            }
            if ($this->filled('origin_lat') && $this->filled('origin_lng') && $this->filled('destination_lat') && $this->filled('destination_lng')) {
                return;
            }

            $validator->errors()->add('origin_lat', 'Selecciona en el mapa tanto el punto de salida como el punto de llegada.');
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'origin' => trim((string) $this->input('origin')),
            'destination' => trim((string) $this->input('destination')),
            'permitted_cargo_type' => trim((string) $this->input('permitted_cargo_type')),
        ]);
    }
}
