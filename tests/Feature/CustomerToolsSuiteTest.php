<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\EmiPartner;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerToolsSuiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_useful_tools_landing_page_renders_cleanly(): void
    {
        $response = $this->get('/tools');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Tools/Index'));
    }

    public function test_ac_btu_calculator_renders_cleanly(): void
    {
        $response = $this->get('/tools/btu-calculator');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Tools/BtuCalculator'));
    }

    public function test_emi_calculator_renders_with_bank_partners(): void
    {
        EmiPartner::create([
            'bank_name' => 'BRAC Bank',
            'min_amount' => 5000,
            'available_tenures' => [3, 6, 9, 12, 18, 24, 36],
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $response = $this->get('/tools/emi-calculator');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Tools/EmiCalculator')
            ->has('banks')
            ->has('partners')
        );
    }

    public function test_third_party_pickup_points_renders_with_data(): void
    {
        $response = $this->get('/tools/third-party-pickup-points');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Tools/PickupPoints')
            ->has('pickupPoints')
            ->has('couriers')
            ->has('districts')
        );
    }

    public function test_privacy_policy_page_renders_cleanly(): void
    {
        $response = $this->get('/privacy-policy');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('CmsPage')
            ->where('title', 'Privacy Policy')
            ->where('slug', 'privacy-policy')
        );
    }

    public function test_generic_cms_page_renders_cleanly(): void
    {
        $response = $this->get('/page/warranty-policy');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('CmsPage')
            ->where('slug', 'warranty-policy')
        );
    }

    public function test_about_us_page_renders_cleanly(): void
    {
        $response = $this->get('/about-us');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('AboutUs'));
    }

    public function test_complain_box_page_renders_and_handles_submission(): void
    {
        $response = $this->get('/complain-box');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('ComplainBox'));

        $postResponse = $this->post('/complain-box', [
            'name' => 'Sahab Uddin',
            'phone' => '01951413828',
            'email' => 'sahabuddinriyaj984@gmail.com',
            'subject' => 'Late Delivery Issue',
            'details' => 'Please update tracking status on my recent order.',
        ]);

        $postResponse->assertSessionHas('success');
        $this->assertDatabaseHas('support_tickets', [
            'customer_name' => 'Sahab Uddin',
            'customer_email' => 'sahabuddinriyaj984@gmail.com',
            'subject' => 'Late Delivery Issue',
        ]);
    }
}
