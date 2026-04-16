<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\Role;
use App\Models\Transporter;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register', [
            'roles' => Role::query()
                ->whereIn('slug', Role::publicRegistrationSlugs())
                ->orderBy('name')
                ->get(),
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
            'phone' => ['required', 'string', 'max:20', 'unique:'.User::class],
            'role' => [
                'required',
                'string',
                Rule::exists('roles', 'slug')->where(fn ($query) => $query->whereIn('slug', Role::publicRegistrationSlugs())),
            ],
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
                Transporter::create([
                    'user_id' => $user->id,
                ]);
            }

            if ($role->slug === Role::PRODUCER) {
                Producer::create([
                    'user_id' => $user->id,
                ]);
            }

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
