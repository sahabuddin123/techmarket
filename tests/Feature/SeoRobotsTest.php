<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SeoRobotsTest extends TestCase
{
    use RefreshDatabase;

    public function test_robots_txt_disallows_private_routes_and_includes_sitemap(): void
    {
        $response = $this->get('/robots.txt');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $response->assertSee('Disallow: /admin/');
        $response->assertSee('Disallow: /checkout');
        $response->assertSee('Sitemap:');
    }
}
