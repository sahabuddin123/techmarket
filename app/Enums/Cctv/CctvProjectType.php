<?php

namespace App\Enums\Cctv;

enum CctvProjectType: string
{
    case RESIDENTIAL_HOME = 'residential_home';
    case APARTMENT_BUILDING = 'apartment_building';
    case COMMERCIAL_OFFICE = 'commercial_office';
    case RETAIL_SHOP = 'retail_shop';
    case WAREHOUSE_FACTORY = 'warehouse_factory';
    case HOSPITAL_CLINIC = 'hospital_clinic';
    case SCHOOL_COLLEGE = 'school_college';
    case OUTDOOR_FARM = 'outdoor_farm';
    case CUSTOM = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::RESIDENTIAL_HOME => 'Residential House / Villa',
            self::APARTMENT_BUILDING => 'Multi-Storey Apartment Building',
            self::COMMERCIAL_OFFICE => 'Corporate Commercial Office',
            self::RETAIL_SHOP => 'Retail Shop / Supermarket',
            self::WAREHOUSE_FACTORY => 'Industrial Warehouse / Factory',
            self::HOSPITAL_CLINIC => 'Hospital / Medical Center',
            self::SCHOOL_COLLEGE => 'School / University Campus',
            self::OUTDOOR_FARM => 'Outdoor / Farm / Open Area',
            self::CUSTOM => 'Custom Tailored Project',
        };
    }
}
