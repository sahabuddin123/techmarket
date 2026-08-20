<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string'],
            'email' => ['sometimes', 'nullable', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $login = $this->input('login') ?: $this->input('phone') ?: $this->input('email');
        $password = $this->input('password');
        $remember = $this->boolean('remember');

        if (!$login) {
            throw ValidationException::withMessages([
                'phone' => 'Please enter your phone number or email address.',
            ]);
        }

        // Determine if login is email or phone
        $isEmail = filter_var($login, FILTER_VALIDATE_EMAIL);
        $field = $isEmail ? 'email' : 'phone';

        $authenticated = Auth::attempt([$field => $login, 'password' => $password], $remember);

        if (!$authenticated) {
            // Fallback check on other field
            $fallbackField = $field === 'email' ? 'phone' : 'email';
            $authenticated = Auth::attempt([$fallbackField => $login, 'password' => $password], $remember);
        }

        if (!$authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'phone' => 'The provided credentials do not match our records.',
                'email' => 'The provided credentials do not match our records.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'phone' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        $login = $this->input('login') ?: $this->input('phone') ?: $this->input('email') ?: 'guest';
        return Str::transliterate(Str::lower($login).'|'.$this->ip());
    }
}
