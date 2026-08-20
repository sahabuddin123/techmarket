<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\CustomerPhoneRecoveryMail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class ForgotPhoneController extends Controller
{
    /**
     * Handle an incoming request to retrieve forgotten phone number by email.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            try {
                Mail::to($user->email)->send(new CustomerPhoneRecoveryMail($user));
            } catch (\Exception $e) {
                // Ignore mail failure in local or handle gracefully
            }
        }

        return back()->with('phone_status', 'If your email is registered, we have sent your phone number to your inbox.');
    }
}
