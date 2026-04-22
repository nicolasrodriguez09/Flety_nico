<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthLoadingController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Auth/LoginRedirect', [
            'redirectTo' => route($user->homeRouteName(), absolute: false),
            'roleName' => $user->role?->name ?? 'Usuario',
            'dashboardLabel' => match ($user->role?->slug) {
                'transportista' => 'Panel transportista',
                'productor' => 'Panel productor',
                'administrador' => 'Panel administrador',
                default => 'Panel Flety',
            },
        ]);
    }
}
