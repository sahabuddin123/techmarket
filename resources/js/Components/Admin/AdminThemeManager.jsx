import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

// Font mapping helper
export const ADMIN_FONT_FAMILIES = {
  'Inter': "'Inter', system-ui, -apple-system, sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  'Manrope': "'Manrope', system-ui, -apple-system, sans-serif",
  'DM Sans': "'DM Sans', system-ui, -apple-system, sans-serif",
  'IBM Plex Sans': "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  'Source Sans 3': "'Source Sans 3', system-ui, -apple-system, sans-serif",
};

// Helper: Adjust color brightness
function adjustBrightness(hex, percent) {
  if (!hex || !hex.startsWith('#')) return hex;
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

// Generate CSS Variable string
export function generateThemeCssVariables(themeSettings = {}) {
  const primary = themeSettings.admin_primary_color || '#4f46e5';
  const primaryHover = adjustBrightness(primary, -15);
  const secondary = themeSettings.admin_secondary_color || '#6366f1';
  const accent = themeSettings.admin_accent_color || '#8b5cf6';
  const success = themeSettings.admin_success_color || '#10b981';
  const warning = themeSettings.admin_warning_color || '#f59e0b';
  const danger = themeSettings.admin_danger_color || '#ef4444';
  const info = themeSettings.admin_info_color || '#3b82f6';
  
  const pageBg = themeSettings.admin_page_bg || '#f8fafc';
  const surface = themeSettings.admin_card_bg || '#ffffff';
  const sidebar = themeSettings.admin_sidebar_bg || '#ffffff';
  const header = themeSettings.admin_header_bg || '#ffffff';
  const border = themeSettings.admin_border_color || '#e2e8f0';
  const textPrimary = themeSettings.admin_text_primary || '#0f172a';
  const textSecondary = themeSettings.admin_text_secondary || '#475569';
  const radius = themeSettings.admin_border_radius || '12px';

  const bodyFontKey = themeSettings.admin_font_family || 'Inter';
  const headingFontKey = themeSettings.admin_heading_font || bodyFontKey;
  const bodyFont = ADMIN_FONT_FAMILIES[bodyFontKey] || ADMIN_FONT_FAMILIES['Inter'];
  const headingFont = ADMIN_FONT_FAMILIES[headingFontKey] || bodyFont;

  return `
    :root, .admin-theme-root {
      --admin-primary: ${primary};
      --admin-primary-hover: ${primaryHover};
      --admin-primary-light: ${primary}15;
      --admin-primary-subtle: ${primary}12;
      --admin-primary-glow: ${primary}25;
      --admin-secondary: ${secondary};
      --admin-accent: ${accent};
      --admin-success: ${success};
      --admin-warning: ${warning};
      --admin-danger: ${danger};
      --admin-info: ${info};
      --admin-bg: ${pageBg};
      --admin-surface: ${surface};
      --admin-sidebar: ${sidebar};
      --admin-header: ${header};
      --admin-border: ${border};
      --admin-border-focus: ${primary};
      --admin-text-primary: ${textPrimary};
      --admin-text: ${textPrimary};
      --admin-text-secondary: ${textSecondary};
      --admin-radius: ${radius};
      --admin-font-family: ${bodyFont};
      --admin-font-heading: ${headingFont};
      --admin-modal-sm: 480px;
      --admin-modal-md: 600px;
      --admin-modal-lg: 740px;
      --admin-modal-xl: 880px;
      --admin-modal-2xl: 960px;
    }
  `;
}

export default function AdminThemeManager({ previewSettings = null }) {
  const { props } = usePage();
  const settings = previewSettings || props?.settings || {};

  useEffect(() => {
    const css = generateThemeCssVariables(settings);
    let styleEl = document.getElementById('admin-dynamic-theme-vars');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'admin-dynamic-theme-vars';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = css;

    // Apply favicon if configured
    if (settings.admin_favicon) {
      let linkEl = document.querySelector("link[rel*='icon']");
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.rel = 'shortcut icon';
        document.head.appendChild(linkEl);
      }
      linkEl.href = settings.admin_favicon;
    }
  }, [settings]);

  return null;
}
