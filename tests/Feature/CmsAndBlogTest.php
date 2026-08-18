<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\CmsPage;
use App\Models\BlogPost;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CmsAndBlogTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_view_published_cms_pages_and_sitemap(): void
    {
        CmsPage::create([
            'title' => 'Terms of Trade',
            'slug' => 'terms-of-trade',
            'content' => 'Trade terms regulations in Bangladesh.',
            'is_published' => true,
        ]);

        $response = $this->get('/page/terms-of-trade');
        $response->assertStatus(200);

        $sitemapResponse = $this->get('/sitemap.xml');
        $sitemapResponse->assertStatus(200);
        $sitemapResponse->assertHeader('Content-Type', 'text/xml; charset=utf-8');
    }

    public function test_public_can_view_blog_posts(): void
    {
        BlogPost::create([
            'title' => 'Best GPUs for 4K Gaming in Bangladesh',
            'slug' => 'best-4k-gpus-bd',
            'category' => 'Hardware Guide',
            'content' => 'Reviewing RTX 4080 Super vs RX 7900 XTX.',
            'is_published' => true,
        ]);

        $response = $this->get('/blog');
        $response->assertStatus(200);

        $showResponse = $this->get('/blog/best-4k-gpus-bd');
        $showResponse->assertStatus(200);
    }
}
