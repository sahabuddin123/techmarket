/**
 * CCTV Estimator & System Builder Domain Type Definitions
 * Enterprise HandyBang Commerce Platform
 */

export type CctvSystemType = 'analog' | 'ip' | 'hybrid' | 'wifi' | 'all';

export type CctvProductType =
  | 'camera'
  | 'dvr'
  | 'nvr'
  | 'xvr'
  | 'storage'
  | 'poe_switch'
  | 'network_switch'
  | 'router'
  | 'monitor'
  | 'ups'
  | 'power_supply'
  | 'smps'
  | 'cable'
  | 'connector'
  | 'junction_box'
  | 'bracket'
  | 'rack'
  | 'patch_panel'
  | 'balun'
  | 'conduit'
  | 'adapter'
  | 'accessories'
  | 'installation_material'
  | 'service'
  | 'other';

export type CctvDeviceType = 'dvr' | 'nvr' | 'xvr';

export type CctvProjectType =
  | 'residential_home'
  | 'apartment_building'
  | 'commercial_office'
  | 'retail_shop'
  | 'warehouse_factory'
  | 'hospital_clinic'
  | 'school_college'
  | 'outdoor_farm'
  | 'custom';

export type CctvEstimateStatus = 'draft' | 'calculated' | 'saved' | 'quoted' | 'ordered' | 'archived';

export type CctvEstimateItemType =
  | 'selected_camera'
  | 'recording_device'
  | 'storage_hdd'
  | 'cable_roll'
  | 'network_poe'
  | 'power_supply'
  | 'required_accessory'
  | 'optional_accessory'
  | 'installation_service'
  | 'custom_line_item';

export type CctvQuoteStatus = 'draft' | 'issued' | 'accepted' | 'declined' | 'converted_to_order' | 'expired';

export interface CctvProductProfile {
  id: number;
  product_id: number;
  product_type: CctvProductType;
  system_type: CctvSystemType;
  camera_form_factor?: string | null;
  resolution_mp?: number | null;
  resolution_label?: string | null;
  lens_mm?: number | null;
  lens_type?: string | null;
  ir_distance_meters?: number | null;
  low_light_tech?: string | null;
  audio_type: string;
  ai_features?: string[] | null;
  ip_rating?: string | null;
  environment: 'indoor' | 'outdoor' | 'both';
  power_source: string;
  power_consumption_watts?: number | null;
  poe_standard?: string | null;
  supported_codecs?: string[] | null;
  specifications?: Record<string, any> | null;
  is_active: boolean;
}

export interface CctvDeviceProfile {
  id: number;
  product_id: number;
  device_type: CctvDeviceType;
  channel_count: number;
  ip_channels_max: number;
  analog_channels_max: number;
  max_camera_resolution_mp: number;
  max_incoming_bandwidth_mbps?: number | null;
  supported_codecs?: string[] | null;
  hdd_bay_count: number;
  max_hdd_capacity_tb_per_bay: number;
  poe_port_count: number;
  poe_budget_watts: number;
  network_ports_count: number;
  alarm_in_count: number;
  alarm_out_count: number;
  audio_in_count: number;
  audio_out_count: number;
  raid_supported?: string[] | null;
  two_way_audio_support: boolean;
  ai_by_device_features?: Record<string, any> | null;
  specifications?: Record<string, any> | null;
}

export interface CctvStorageProfile {
  id: number;
  product_id: number;
  capacity_tb: number;
  form_factor: string;
  interface_type: string;
  rpm: number;
  cache_mb: number;
  workload_rating_tb_yr: number;
  is_surveillance_optimized: boolean;
  max_drive_bays_supported: number;
  recommended_cameras_max: number;
}

export interface CctvCableProfile {
  id: number;
  product_id: number;
  cable_type: string;
  core_material: string;
  shielding: string;
  is_outdoor_rated: boolean;
  max_recommended_distance_meters: number;
  unit_of_measure: string;
  meters_per_unit: number;
  gauge_awg: number;
}

export interface CctvRequirementPayload {
  project_name: string;
  project_type: CctvProjectType;
  system_type: CctvSystemType;
  total_cameras: number;
  indoor_cameras: number;
  outdoor_cameras: number;
  ptz_cameras: number;
  required_resolution_mp?: number | null;
  recording_days: number;
  recording_hours_per_day: number;
  recording_mode: 'continuous' | 'motion_only' | 'scheduled';
  preferred_codec: string;
  require_audio: boolean;
  require_ai_detection: boolean;
  require_color_night_vision: boolean;
  require_remote_viewing: boolean;
  require_installation: boolean;
  average_cable_distance_meters: number;
  floors_count: number;
  areas_count: number;
  location_district?: string | null;
  location_address?: string | null;
  notes?: string | null;
}

export interface StorageCalculationMetrics {
  bitrate_per_camera_kbps: number;
  total_incoming_bandwidth_mbps: number;
  daily_storage_gb: number;
  net_required_storage_gb: number;
  net_required_storage_tb: number;
  gross_required_storage_tb_with_overhead: number;
  recommended_hdd_capacity_tb: number;
  recommended_hdd_bays_required: number;
  recommended_hdd_model_suggestion: string;
  calculation_breakdown?: Record<string, any>;
}

export interface CableCalculationMetrics {
  net_camera_distance_meters: number;
  inter_floor_riser_meters: number;
  waste_and_slack_meters: number;
  gross_total_cable_meters: number;
  recommended_rolls_count: number;
  meters_per_roll: number;
  recommended_cable_package_type: string;
  recommended_cable_description: string;
}

export interface CompatibilityValidationResult {
  is_compatible: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  validated_pairs?: Record<string, any>[];
}

export interface CctvEstimateBOMItem {
  id?: number;
  product_id?: number | null;
  item_type: CctvEstimateItemType;
  product_sku_snapshot: string;
  product_name_snapshot: string;
  product_type: string;
  system_type: string;
  unit_price_snapshot: number;
  quantity: number;
  unit: string;
  subtotal_price: number;
  is_required: boolean;
  is_recommended: boolean;
  recommendation_reason?: string | null;
  compatibility_status: 'compatible' | 'warning' | 'forced_override';
  image_url?: string | null;
  metadata?: Record<string, any>;
}

export interface CctvEstimateSummary {
  estimate_id?: number | null;
  estimate_number: string;
  project_name: string;
  project_type: CctvProjectType;
  system_type: CctvSystemType;
  status: CctvEstimateStatus;
  items: CctvEstimateBOMItem[];
  subtotal_amount: number;
  accessory_amount: number;
  installation_amount: number;
  discount_amount: number;
  grand_total: number;
  currency: string;
  storage_metrics?: StorageCalculationMetrics | null;
  cable_metrics?: CableCalculationMetrics | null;
  validation?: CompatibilityValidationResult | null;
  requirements_snapshot?: CctvRequirementPayload;
  notes?: string | null;
}

export interface CctvQuoteData {
  id: number;
  quote_number: string;
  estimate_id: number;
  user_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  company_name?: string | null;
  valid_until: string;
  status: CctvQuoteStatus;
  subtotal: number;
  discount_amount: number;
  installation_amount: number;
  tax_amount: number;
  shipping_amount: number;
  grand_total: number;
  terms_and_conditions?: string | null;
  notes?: string | null;
  converted_order_id?: number | null;
  created_at: string;
}
