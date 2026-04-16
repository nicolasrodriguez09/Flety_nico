<x-guest-layout>
    <form method="POST" action="{{ route('register') }}">
        @csrf

        <div>
            <x-input-label for="name" :value="__('Nombre completo')" />
            <x-text-input id="name" class="block mt-1 w-full" type="text" name="name" :value="old('name')" required autofocus autocomplete="name" />
            <x-input-error :messages="$errors->get('name')" class="mt-2" />
        </div>

        <div class="mt-4">
            <x-input-label for="email" :value="__('Correo electrónico')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <div class="mt-4">
            <x-input-label for="phone" :value="__('Teléfono')" />
            <x-text-input id="phone" class="block mt-1 w-full" type="text" name="phone" :value="old('phone')" required autocomplete="tel" />
            <x-input-error :messages="$errors->get('phone')" class="mt-2" />
        </div>

        <div class="mt-4">
            <x-input-label for="role" :value="__('Tipo de cuenta')" />
            <select
                id="role"
                name="role"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
            >
                <option value="">{{ __('Selecciona un rol') }}</option>
                @foreach ($roles as $role)
                    <option value="{{ $role->slug }}" @selected(old('role') === $role->slug)>
                        {{ $role->name }}
                    </option>
                @endforeach
            </select>
            <x-input-error :messages="$errors->get('role')" class="mt-2" />
        </div>

        <div class="mt-4">
            <x-input-label for="password" :value="__('Contraseña')" />

            <x-text-input id="password" class="block mt-1 w-full"
                            type="password"
                            name="password"
                            required autocomplete="new-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <div class="mt-4">
            <x-input-label for="password_confirmation" :value="__('Confirmar contraseña')" />

            <x-text-input id="password_confirmation" class="block mt-1 w-full"
                            type="password"
                            name="password_confirmation" required autocomplete="new-password" />

            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
        </div>

        <div class="flex items-center justify-end mt-4">
            <a class="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" href="{{ route('login') }}">
                {{ __('¿Ya tienes cuenta?') }}
            </a>

            <x-primary-button class="ms-4">
                {{ __('Crear cuenta') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
