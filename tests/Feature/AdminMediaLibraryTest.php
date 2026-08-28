<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminMediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Officer',
            'email' => 'admin@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->customer = User::create([
            'name' => 'Regular Customer',
            'email' => 'customer@techmarket.com',
            'password' => bcrypt('password123'),
            'role' => 'customer',
        ]);

        Storage::fake('public');
    }

    public function test_unauthorized_customer_cannot_access_media_library(): void
    {
        $this->actingAs($this->customer);

        $response = $this->get('/admin/media');
        $response->assertStatus(403);

        $uploadResponse = $this->post('/admin/media/upload', [
            'file' => UploadedFile::fake()->image('hacked.png'),
        ]);
        $uploadResponse->assertStatus(403);
    }

    public function test_authorized_admin_can_view_media_library(): void
    {
        $this->actingAs($this->admin);

        Media::create([
            'filename' => '20260817_banner.webp',
            'original_name' => 'banner.webp',
            'path' => 'media/banners/2026/08/banner.webp',
            'mime_type' => 'image/webp',
            'size' => 120000,
            'folder' => 'banners',
            'user_id' => $this->admin->id,
        ]);

        $response = $this->get('/admin/media');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Media/Index')
            ->has('media.data')
            ->has('folders')
            ->has('total_size')
        );
    }

    public function test_admin_can_upload_valid_image(): void
    {
        $this->actingAs($this->admin);

        $file = UploadedFile::fake()->image('rtx4090-showcase.png', 1200, 800);

        $response = $this->post('/admin/media/upload', [
            'file' => $file,
            'folder' => 'products',
            'alt_text' => 'GeForce RTX 4090 GPU',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('media', [
            'original_name' => 'rtx4090-showcase.png',
            'folder' => 'products',
            'alt_text' => 'GeForce RTX 4090 GPU',
        ]);

        $media = Media::where('original_name', 'rtx4090-showcase.png')->first();
        $this->assertNotNull($media);
        Storage::disk('public')->assertExists($media->path);
    }

    public function test_invalid_file_type_is_rejected(): void
    {
        $this->actingAs($this->admin);

        $invalidFile = UploadedFile::fake()->create('malicious.php', 50, 'application/x-php');

        $response = $this->post('/admin/media/upload', [
            'file' => $invalidFile,
            'folder' => 'general',
        ]);

        $response->assertSessionHasErrors('file');
        $this->assertDatabaseMissing('media', ['original_name' => 'malicious.php']);
    }

    public function test_admin_can_update_media_metadata(): void
    {
        $this->actingAs($this->admin);

        $media = Media::create([
            'filename' => '20260817_cpu.webp',
            'original_name' => 'intel-i9.webp',
            'path' => 'media/products/2026/08/intel-i9.webp',
            'mime_type' => 'image/webp',
            'size' => 85000,
            'folder' => 'general',
        ]);

        $response = $this->put("/admin/media/{$media->id}", [
            'title' => 'Intel Core i9 14900K Box',
            'alt_text' => 'Intel i9 14th gen processor photo',
            'caption' => 'Official retail packaging',
            'folder' => 'products',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $media->refresh();
        $this->assertEquals('Intel Core i9 14900K Box', $media->title);
        $this->assertEquals('products', $media->folder);
    }

    public function test_admin_can_delete_unused_media_safely(): void
    {
        $this->actingAs($this->admin);

        $file = UploadedFile::fake()->image('temp-banner.jpg', 600, 300);
        $storedPath = $file->store('media/banners/2026/08', 'public');

        $media = Media::create([
            'filename' => basename($storedPath),
            'original_name' => 'temp-banner.jpg',
            'path' => $storedPath,
            'mime_type' => 'image/jpeg',
            'size' => 45000,
            'folder' => 'banners',
        ]);

        Storage::disk('public')->assertExists($storedPath);

        $response = $this->delete("/admin/media/{$media->id}");
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('media', ['id' => $media->id]);
        Storage::disk('public')->assertMissing($storedPath);
    }

    public function test_admin_can_query_media_api_for_media_picker(): void
    {
        $this->actingAs($this->admin);

        Media::create([
            'filename' => '20260817_keyboard.png',
            'original_name' => 'mechanical-keyboard.png',
            'path' => 'media/products/keyboard.png',
            'mime_type' => 'image/png',
            'size' => 75000,
            'folder' => 'products',
        ]);

        $response = $this->getJson('/admin/api/media?folder=products');
        $response->assertStatus(200);
        $response->assertJsonFragment(['original_name' => 'mechanical-keyboard.png']);

        $dataResponse = $this->getJson('/admin/media/data?folder=products');
        $dataResponse->assertStatus(200);
        $dataResponse->assertJsonFragment(['original_name' => 'mechanical-keyboard.png']);

        $folderResponse = $this->getJson('/admin/media/folders');
        $folderResponse->assertStatus(200);
        $folderResponse->assertJsonStructure(['all', 'products', 'categories', 'total_size']);
    }

    public function test_inertia_request_receives_valid_inertia_response_never_plain_json(): void
    {
        $this->actingAs($this->admin);

        $response = $this->get('/admin/media');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Media/Index')
            ->has('media')
            ->has('folders')
            ->has('total_size')
        );

        // Verify the response is not raw JSON string payload
        $this->assertFalse(str_starts_with($response->getContent(), '{"media":'));
    }

    public function test_inertia_file_upload_returns_redirect_not_plain_json(): void
    {
        $this->actingAs($this->admin);

        $file = UploadedFile::fake()->image('inertia-banner.png', 1200, 800);

        $response = $this->withHeaders([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
        ])->post('/admin/media/upload', [
            'file' => $file,
            'folder' => 'banners',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertFalse(str_starts_with($response->getContent(), '{"success":true'));
    }
}
