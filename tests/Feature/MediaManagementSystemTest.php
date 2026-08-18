<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\MediaService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MediaManagementSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_uploads_valid_image_and_rejects_invalid_mime(): void
    {
        Storage::fake('public');

        $validFile = UploadedFile::fake()->image('test_product.jpg', 600, 600);
        $url = MediaService::uploadImage($validFile, 'products');

        $this->assertNotEmpty($url);

        // Invalid file type rejection
        $this->expectException(\InvalidArgumentException::class);
        $invalidFile = UploadedFile::fake()->create('script.sh', 100, 'text/x-shellscript');
        MediaService::uploadImage($invalidFile, 'products');
    }
}
