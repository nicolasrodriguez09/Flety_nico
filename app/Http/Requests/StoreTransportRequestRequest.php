<?php

namespace App\Http\Requests;

use App\Models\Producer;
use App\Models\TransportRequest;
use App\Models\TransportRoute;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTransportRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isProducer() ?? false;
    }

    /**
     * @return array<string, array<int, \Illuminate\Contracts\Validation\ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'transport_route_id' => [
                'required',
                'integer',
                Rule::exists('transport_routes', 'id')->where(fn ($query) => $query->where('status', TransportRoute::STATUS_PUBLISHED)),
            ],
            'cargo_weight_kg' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'product_type' => ['required', 'string', 'max:100'],
            'delivery_destination' => ['required', 'string', 'max:255'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $producer = $this->user()?->producerProfile;
            $route = TransportRoute::query()
                ->with('transporter.user')
                ->find($this->integer('transport_route_id'));

            if (! $producer instanceof Producer) {
                $validator->errors()->add('transport_route_id', 'El perfil de productor no existe.');

                return;
            }

            if (! $route) {
                return;
            }

            if ($route->status !== TransportRoute::STATUS_PUBLISHED) {
                $validator->errors()->add('transport_route_id', 'Solo se pueden solicitar rutas publicadas.');
            }

            if (! $route->transporter?->isValidated()) {
                $validator->errors()->add('transport_route_id', 'Solo se pueden solicitar rutas de transportistas aprobados.');
            }

            if ($route->departure_at?->isPast()) {
                $validator->errors()->add('transport_route_id', 'La ruta ya no se encuentra disponible.');
            }

            if ((float) $this->input('cargo_weight_kg') > (float) $route->available_capacity_kg) {
                $validator->errors()->add('cargo_weight_kg', 'La carga excede la capacidad disponible de la ruta.');
            }

            if ($route->transporter?->user_id === $this->user()?->id) {
                $validator->errors()->add('transport_route_id', 'No puedes solicitar una ruta publicada por tu propio usuario.');
            }

            $alreadyRequested = TransportRequest::query()
                ->where('transport_route_id', $route->id)
                ->where('producer_id', $producer->id)
                ->whereIn('status', [TransportRequest::STATUS_PENDING, TransportRequest::STATUS_ACCEPTED])
                ->exists();

            if ($alreadyRequested) {
                $validator->errors()->add('transport_route_id', 'Ya tienes una solicitud activa para esta ruta.');
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'product_type' => trim((string) $this->input('product_type')),
            'delivery_destination' => trim((string) $this->input('delivery_destination')),
        ]);
    }
}
