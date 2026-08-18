<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Order;
use App\Models\Media;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SecurityHardeningAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_are_present_on_web_responses(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy');
    }

    public function test_non_admin_user_cannot_access_admin_panel(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer)->get('/admin');

        $response->assertStatus(403);
    }

    public function test_invoice_idor_protection_prevents_unauthorized_user_access(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();

        $order = Order::create([
            'order_number' => 'TMB-20260817-999888',
            'user_id' => $owner->id,
            'customer_name' => 'John Doe',
            'customer_email' => 'johndoe@example.com',
            'customer_phone' => '01711111111',
            'shipping_address' => 'House 1, Road 2, Dhaka',
            'district' => 'Dhaka',
            'payment_method' => 'cod',
            'subtotal' => 5000,
            'total' => 5060,
            'status' => 'Pending',
        ]);

        // Stranger user should get 403 Forbidden
        $response = $this->actingAs($stranger)->get("/invoice/{$order->order_number}");
        $response->assertStatus(403);

        // Owner should get 200 OK
        $ownerResponse = $this->actingAs($owner)->get("/invoice/{$order->order_number}");
        $ownerResponse->assertStatus(200);
    }

    public function test_admin_cannot_self_lockout_from_admin_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $adminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $customerRole = Role::create(['name' => 'Customer', 'display_name' => 'Customer']);

        $admin->roles()->sync([$adminRole->id]);

        // Attempt to demote self to Customer
        $response = $this->actingAs($admin)->post("/admin/users/{$admin->id}/role", [
            'role_id' => $customerRole->id,
        ]);

        $response->assertSessionHas('error');
        $this->assertTrue($admin->fresh()->isAdmin());
    }

    public function test_svg_upload_is_sanitized_against_xss(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin']);
        $adminRole = Role::create(['name' => 'Super Admin', 'display_name' => 'Super Admin']);
        $admin->roles()->sync([$adminRole->id]);

        $maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script><rect width="100" height="100" onload="alert(1)"/></svg>';
        $file = UploadedFile::fake()->createWithContent('malicious.svg', $maliciousSvg);

        $response = $this->actingAs($admin)->post('/admin/media/upload', [
            'file' => $file,
            'folder' => 'general',
        ]);

        $response->assertStatus(302);

        $media = Media::latest()->first();
        $this->assertNotNull($media);

        $storedContent = Storage::disk('public')->get($media->path);
        $this->assertStringNotContainsString('<script>', $storedContent);
        $this->assertStringNotContainsString('onload=', $storedContent);
    }
}
