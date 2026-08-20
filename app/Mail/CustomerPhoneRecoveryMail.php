<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerPhoneRecoveryMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Registered Account Phone Number — TechMarket BD',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;'>
                    <h2 style='color: #002a5c; margin-top: 0;'>Account Phone Recovery</h2>
                    <p>Hello <strong>" . e($this->user->name) . "</strong>,</p>
                    <p>You requested the registered phone number associated with this email address.</p>
                    <div style='background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;'>
                        <p style='margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;'>Registered Phone Number</p>
                        <p style='margin: 8px 0 0 0; font-size: 24px; font-weight: bold; color: #002a5c; font-family: monospace;'>" . e($this->user->phone ?: 'Not Set') . "</p>
                    </div>
                    <p style='font-size: 13px; color: #64748b;'>You can now use this phone number and your password to sign in to your account.</p>
                    <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;' />
                    <p style='font-size: 11px; color: #94a3b8; margin: 0;'>If you did not request this, please disregard this email or contact support.</p>
                </div>
            "
        );
    }
}
