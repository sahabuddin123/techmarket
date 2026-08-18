<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SecurityRateLimitingTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_endpoint_enforces_rate_limiting_after_excessive_attempts(): void
    {
        $user = User::create(['name' => 'Limit User', 'email' => 'limit@test.com', 'password' => bcrypt('password'), 'role' => 'customer']);

        for ($i = 0; $i < 6; $i++) {
            $this->post('/login', [
                'email' => 'limit@test.com',
                'password' => 'wrong-password',
            ]);
        }

        // 7th request should be throttled (429 Too Many Requests)
        $response = $this->post('/login', [
            'email' => 'limit@test.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(429);
    }
}
