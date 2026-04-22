<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\Role;
use App\Models\Transporter;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        $selectedRole = $request->string('role')->toString();

        return Inertia::render('Auth/Register', [
            'roles' => Role::query()
                ->whereIn('slug', Role::publicRegistrationSlugs())
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'selectedRole' => in_array($selectedRole, Role::publicRegistrationSlugs(), true)
                ? $selectedRole
                : '',
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9\s-]{7,20}$/', 'max:20', 'unique:'.User::class],
            'role' => [
                'required',
                'string',
                Rule::exists('roles', 'slug')->where(fn ($query) => $query->whereIn('slug', Role::publicRegistrationSlugs())),
            ],
            'plate' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'string',
                'max:20',
                Rule::unique('vehicles', 'plate'),
            ],
            'vehicle_type' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'string',
                'max:50',
            ],
            'capacity_kg' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'numeric',
                'gt:0',
                'max:99999999.99',
            ],
            'farm_name' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::PRODUCER),
                'nullable',
                'string',
                'max:255',
            ],
            'farm_location' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::PRODUCER),
                'nullable',
                'string',
                'max:255',
            ],
            'production_type' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $role = Role::query()
            ->where('slug', $request->string('role')->toString())
            ->firstOrFail();

        $user = DB::transaction(function () use ($request, $role) {
            $user = User::create([
                'role_id' => $role->id,
                'name' => $request->string('name')->toString(),
                'email' => $request->string('email')->toString(),
                'phone' => $request->string('phone')->toString(),
                'status' => 'active',
                'password' => Hash::make($request->string('password')->toString()),
            ]);

            if ($role->slug === Role::TRANSPORTER) {
                $transporter = Transporter::create([
                    'user_id' => $user->id,
                ]);

                Vehicle::create([
                    'transporter_id' => $transporter->id,
                    'plate' => strtoupper(trim($request->string('plate')->toString())),
                    'vehicle_type' => $request->string('vehicle_type')->trim()->toString(),
                    'capacity_kg' => $request->input('capacity_kg'),
                    'status' => Vehicle::STATUS_AVAILABLE,
                ]);
            }

            if ($role->slug === Role::PRODUCER) {
                Producer::create([
                    'user_id' => $user->id,
                    'farm_name' => $request->string('farm_name')->trim()->toString(),
                    'farm_location' => $request->string('farm_location')->trim()->toString(),
                    'production_type' => $request->filled('production_type')
                        ? $request->string('production_type')->trim()->toString()
                        : null,
                ]);
            }

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect(route($user->homeRouteName(), absolute: false));
    }
}
