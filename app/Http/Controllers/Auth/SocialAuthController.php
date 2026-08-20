<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the OAuth provider authentication page.
     */
    public function redirect(string $provider): RedirectResponse
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return redirect()->route('login')->withErrors(['oauth' => 'Unsupported login provider.']);
        }

        try {
            return Socialite::driver($provider)->redirect();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'oauth' => "Unable to connect with {$provider}: " . $e->getMessage(),
            ]);
        }
    }

    /**
     * Obtain the user information from OAuth provider.
     */
    public function callback(string $provider): RedirectResponse
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return redirect()->route('login')->withErrors(['oauth' => 'Unsupported login provider.']);
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'oauth' => "Authentication cancelled or failed with {$provider}.",
            ]);
        }

        $idField = $provider . '_id'; // google_id or facebook_id

        // Check if user exists by provider ID or email
        $user = User::where($idField, $socialUser->getId())
            ->orWhere(function ($query) use ($socialUser) {
                if ($socialUser->getEmail()) {
                    $query->where('email', $socialUser->getEmail());
                }
            })
            ->first();

        if ($user) {
            // Update provider ID and avatar if missing
            $user->update([
                $idField => $socialUser->getId(),
                'avatar' => $user->avatar ?: $socialUser->getAvatar(),
            ]);
        } else {
            // Create new user account
            $user = User::create([
                'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: 'Customer',
                'email' => $socialUser->getEmail(),
                $idField => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'password' => Hash::make(Str::random(24)),
                'role' => 'customer',
            ]);
        }

        Auth::login($user, true);
        request()->session()->regenerate();

        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return redirect()->intended(route('account.profile', absolute: false));
    }
}
