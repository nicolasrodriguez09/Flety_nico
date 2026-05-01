<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\DocumentVerification;
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
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
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
        $maxVehicleYear = now()->addYear()->year;

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9\s-]{7,20}$/', 'max:20', 'unique:'.User::class],
            'role' => [
                'required',
                'string',
                Rule::exists('roles', 'slug')->where(fn ($query) => $query->whereIn('slug', Role::publicRegistrationSlugs())),
            ],
            'identity_document' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'string',
                'max:50',
                Rule::unique('transporters', 'identity_document'),
            ],
            'driver_license' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'string',
                'max:50',
                Rule::unique('transporters', 'driver_license'),
            ],
            'identity_document_image' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'image',
                'max:4096',
            ],
            'driver_license_image' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'image',
                'max:4096',
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
            'brand' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'string',
                'max:80',
            ],
            'model' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'string',
                'max:80',
            ],
            'model_year' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'integer',
                'min:1950',
                'max:'.$maxVehicleYear,
            ],
            'color' => ['nullable', 'string', 'max:50'],
            'capacity_kg' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'numeric',
                'gt:0',
                'max:99999999.99',
            ],
            'vehicle_photo' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'image',
                'max:4096',
            ],
            'transit_license_image' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'image',
                'max:4096',
            ],
            'insurance_expires_at' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'date',
                'after_or_equal:today',
            ],
            'insurance_image' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'image',
                'max:4096',
            ],
            'technical_review_expires_at' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'date',
                'after_or_equal:today',
            ],
            'technical_review_image' => [
                Rule::requiredIf(fn () => $request->string('role')->toString() === Role::TRANSPORTER),
                'nullable',
                'image',
                'max:4096',
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
                    'identity_document' => $request->string('identity_document')->trim()->toString(),
                    'driver_license' => $request->string('driver_license')->trim()->toString(),
                    'validation_status' => Transporter::STATUS_PENDING,
                ]);

                DocumentVerification::create([
                    'transporter_id' => $transporter->id,
                    'document_type' => DocumentVerification::TYPE_IDENTITY_DOCUMENT,
                    'file_path' => $request->file('identity_document_image')->store('transporter-documents'),
                    'review_status' => DocumentVerification::STATUS_PENDING,
                    'uploaded_at' => now(),
                ]);

                DocumentVerification::create([
                    'transporter_id' => $transporter->id,
                    'document_type' => DocumentVerification::TYPE_DRIVER_LICENSE,
                    'file_path' => $request->file('driver_license_image')->store('transporter-documents'),
                    'review_status' => DocumentVerification::STATUS_PENDING,
                    'uploaded_at' => now(),
                ]);

                Vehicle::create([
                    'transporter_id' => $transporter->id,
                    'plate' => strtoupper(trim($request->string('plate')->toString())),
                    'vehicle_type' => $request->string('vehicle_type')->trim()->toString(),
                    'brand' => $request->string('brand')->trim()->toString(),
                    'model' => $request->string('model')->trim()->toString(),
                    'model_year' => $request->integer('model_year'),
                    'color' => $request->filled('color')
                        ? $request->string('color')->trim()->toString()
                        : null,
                    'capacity_kg' => $request->input('capacity_kg'),
                    'vehicle_photo_path' => $request->file('vehicle_photo')->store('vehicle-documents', 'public'),
                    'transit_license_image_path' => $request->file('transit_license_image')->store('vehicle-documents', 'public'),
                    'insurance_expires_at' => $request->date('insurance_expires_at'),
                    'insurance_image_path' => $request->file('insurance_image')->store('vehicle-documents', 'public'),
                    'technical_review_expires_at' => $request->date('technical_review_expires_at'),
                    'technical_review_image_path' => $request->file('technical_review_image')->store('vehicle-documents', 'public'),
                    'status' => Vehicle::STATUS_PENDING,
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
