/**
 * Theme Manager for Storefront Version Architecture.
 * Applies CSS variables dynamically based on the active storefront version and database theme config.
 */
export function applyStorefrontTheme(themeConfig, versionKey = 'v3') {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Default theme presets if custom config is missing
  const presets = {
    v1: {
      '--storefront-primary': '#0084ff',
      '--storefront-secondary': '#0c1424',
      '--storefront-accent': '#38bdf8',
      '--storefront-bg': '#f4f7f9',
      '--storefront-surface': '#ffffff',
      '--storefront-text': '#0f172a',
      '--storefront-border': '#e2e8f0',
      '--storefront-radius': '10px',
    },
    v2: {
      '--storefront-primary': '#2563eb',
      '--storefront-secondary': '#0b1a36',
      '--storefront-accent': '#38bdf8',
      '--storefront-bg': '#f8fafc',
      '--storefront-surface': '#ffffff',
      '--storefront-text': '#0f172a',
      '--storefront-border': '#cbd5e1',
      '--storefront-radius': '12px',
    },
    v3: {
      '--storefront-primary': '#0153FD',
      '--storefront-secondary': '#002268',
      '--storefront-accent': '#CAE0FF',
      '--storefront-bg': '#F4F7FC',
      '--storefront-surface': '#ffffff',
      '--storefront-text': '#0f172a',
      '--storefront-border': '#8BB1FF',
      '--storefront-radius': '22px',
    },
  };

  const activePreset = presets[versionKey] || presets.v3;

  const applied = {
    '--storefront-primary': themeConfig?.primary_color || activePreset['--storefront-primary'],
    '--storefront-secondary': themeConfig?.secondary_color || activePreset['--storefront-secondary'],
    '--storefront-accent': themeConfig?.accent_color || activePreset['--storefront-accent'],
    '--storefront-bg': themeConfig?.background_color || activePreset['--storefront-bg'],
    '--storefront-surface': themeConfig?.surface_color || activePreset['--storefront-surface'],
    '--storefront-text': themeConfig?.text_color || activePreset['--storefront-text'],
    '--storefront-border': themeConfig?.border_color || activePreset['--storefront-border'],
    '--storefront-radius': themeConfig?.border_radius || activePreset['--storefront-radius'],
  };

  Object.entries(applied).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}
