<?php

namespace Tests\Feature;

use App\Mail\CustomerPhoneRecoveryMail;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CustomerAuthModalAndRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_view_login_and_register_pages(): void
    {
        $responseLogin = $this->get(route('login'));
        $responseLogin->assertStatus(200);

        $responseRegister = $this->get(route('register'));
        $responseRegister->assertStatus(200);
    }

    public function test_customer_can_register_new_account_with_mandatory_phone(): void
    {
        $response = $this->post(route('register'), [
            'name' => 'John Doe',
            'phone' => '01712345678',
            'email' => 'johndoe@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'phone' => '01712345678',
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
        ]);

        $response->assertRedirect(route('account.profile', absolute: false));
    }

    public function test_customer_registration_fails_if_phone_is_missing_or_duplicate(): void
    {
        User::factory()->create(['phone' => '01899999999']);

        // Missing phone
        $responseMissing = $this->post(route('register'), [
            'name' => 'Jane Doe',
            'phone' => '',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $responseMissing->assertSessionHasErrors('phone');

        // Duplicate phone
        $responseDup = $this->post(route('register'), [
            'name' => 'Jane Doe',
            'phone' => '01899999999',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);
        $responseDup->assertSessionHasErrors('phone');
    }

    public function test_customer_can_login_with_phone_number_and_password(): void
    {
        $user = User::factory()->create([
            'phone' => '01700000001',
            'password' => Hash::make('MySecretPassword123'),
        ]);

        $response = $this->post(route('login'), [
            'phone' => '01700000001',
            'password' => 'MySecretPassword123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('account.profile', absolute: false));
    }

    public function test_customer_can_login_with_email_and_password(): void
    {
        $user = User::factory()->create([
            'email' => 'customer@techmarket.com',
            'password' => Hash::make('MySecretPassword123'),
        ]);

        $response = $this->post(route('login'), [
            'phone' => 'customer@techmarket.com',
            'password' => 'MySecretPassword123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('account.profile', absolute: false));
    }

    public function test_customer_cannot_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'phone' => '01700000002',
            'password' => Hash::make('MySecretPassword123'),
        ]);

        $response = $this->post(route('login'), [
            'phone' => '01700000002',
            'password' => 'WrongPassword',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors();
    }

    public function test_customer_can_retrieve_forgotten_phone_via_email(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'forgetful@techmarket.com',
            'phone' => '01987654321',
        ]);

        $response = $this->post(route('phone.forgot'), [
            'email' => 'forgetful@techmarket.com',
        ]);

        $response->assertSessionHas('phone_status');

        Mail::assertSent(CustomerPhoneRecoveryMail::class, function ($mail) use ($user) {
            return $mail->hasTo('forgetful@techmarket.com') && $mail->user->phone === '01987654321';
        });
    }

    public function test_customer_can_request_forgot_password_reset_link(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'recovery@techmarket.com',
        ]);

        $response = $this->post(route('password.email'), [
            'email' => 'recovery@techmarket.com',
        ]);

        $response->assertSessionHas('status');
        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_customer_can_reset_password_and_login_with_new_password(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'resetuser@techmarket.com',
            'phone' => '01511111111',
            'password' => Hash::make('OldPassword123'),
        ]);

        $this->post(route('password.email'), [
            'email' => 'resetuser@techmarket.com',
        ]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            // Render reset screen
            $screenResponse = $this->get(route('password.reset', ['token' => $notification->token]));
            $screenResponse->assertStatus(200);

            // Post new password
            $resetResponse = $this->post(route('password.store'), [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'BrandNewPassword999!',
                'password_confirmation' => 'BrandNewPassword999!',
            ]);

            $resetResponse->assertSessionHasNoErrors();
            $resetResponse->assertRedirect(route('login'));

            // Verify user can now log in with phone and new password
            $loginResponse = $this->post(route('login'), [
                'phone' => '01511111111',
                'password' => 'BrandNewPassword999!',
            ]);

            $this->assertAuthenticatedAs($user);
            $loginResponse->assertRedirect(route('account.profile', absolute: false));

            return true;
        });
    }

    public function test_oauth_redirect_route_works_for_google_and_facebook(): void
    {
        config(['services.google.client_id' => 'test-client-id']);
        config(['services.google.client_secret' => 'test-client-secret']);
        config(['services.google.redirect' => 'http://localhost/auth/google/callback']);

        $googleResponse = $this->get(route('oauth.redirect', 'google'));
        $this->assertTrue($googleResponse->isRedirect());

        config(['services.facebook.client_id' => 'test-client-id']);
        config(['services.facebook.client_secret' => 'test-client-secret']);
        config(['services.facebook.redirect' => 'http://localhost/auth/facebook/callback']);

        $fbResponse = $this->get(route('oauth.redirect', 'facebook'));
        $this->assertTrue($fbResponse->isRedirect());
    }

    public function test_customer_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
