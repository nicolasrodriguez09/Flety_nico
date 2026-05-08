<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class SpanishValidationMessagesTest extends TestCase
{
    public function test_validation_messages_are_spanish_and_user_friendly(): void
    {
        $this->assertSame('es', app()->getLocale());

        $validator = Validator::make([
            'origin' => '',
            'cargo_weight_kg' => 'texto',
            'password' => 'secreto',
            'password_confirmation' => 'diferente',
        ], [
            'origin' => ['required'],
            'cargo_weight_kg' => ['numeric'],
            'password' => ['confirmed'],
        ]);

        $this->assertTrue($validator->fails());
        $this->assertSame('Indica el origen de la ruta.', $validator->errors()->first('origin'));
        $this->assertSame('El peso de la carga debe ser un número válido.', $validator->errors()->first('cargo_weight_kg'));
        $this->assertSame('La confirmación de contraseña no coincide.', $validator->errors()->first('password'));
        $this->assertSame('El correo o la contraseña no son correctos.', __('auth.failed'));
    }
}
