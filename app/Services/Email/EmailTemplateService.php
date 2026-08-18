<?php

namespace App\Services\Email;

use App\Models\EmailTemplate;

class EmailTemplateService
{
    /**
     * Interpolate template placeholders safely.
     * Supports {{variable_name}} format and strips unpopulated tags cleanly without crashing.
     */
    public function render(string $content, array $variables = []): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', function ($matches) use ($variables) {
            $key = $matches[1];
            if (array_key_exists($key, $variables)) {
                $val = $variables[$key];
                return is_scalar($val) ? (string) $val : json_encode($val);
            }
            return ''; // Gracefully strip unknown placeholders without crashing
        }, $content);
    }

    /**
     * Wrap raw HTML into enterprise email layout with Bangla font support & web-safe fallbacks.
     */
    public function wrapInLayout(string $bodyHtml, string $title = 'TechMarket BD', ?string $preheader = null): string
    {
        $siteName = config('app.name', 'TechMarket BD');
        $siteUrl = config('app.url', 'http://localhost');
        $preheaderHtml = $preheader ? "<div style=\"display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;\">{$preheader}</div>" : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #0b0f19; font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  {$preheaderHtml}
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <!-- Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 24px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-bottom: 1px solid #1e293b;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="{$siteUrl}" target="_blank" style="text-decoration: none;">
                      <span style="font-size: 22px; font-weight: 900; color: #f59e0b; letter-spacing: -0.5px; font-family: 'Inter', sans-serif;">TECHMARKET<span style="color: #ffffff;"> BD</span></span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              {$bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #94a3b8;">{$siteName} — Bangladesh's Premier Tech & Electronics Store</p>
              <p style="margin: 0 0 12px 0;">Dhaka, Bangladesh • Hotline: 09678-000000 • support@techmarketbd.com</p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; 2026 {$siteName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    /**
     * Compile visual builder schema JSON into clean, bulletproof, responsive HTML tables.
     * Supports all 14 block types:
     * logo, heading, text, image, button, divider, product, product_grid, order_summary, coupon, hero_banner, spacer, social_links, footer
     */
    public function compileEditorSchema(array $schema): string
    {
        $blocks = $schema['blocks'] ?? [];
        $html = '';

        foreach ($blocks as $block) {
            $type = $block['type'] ?? 'text';
            $props = $block['props'] ?? [];

            $html .= match ($type) {
                'logo' => $this->renderLogoBlock($props),
                'heading' => $this->renderHeadingBlock($props),
                'text' => $this->renderTextBlock($props),
                'image' => $this->renderImageBlock($props),
                'button' => $this->renderButtonBlock($props),
                'divider' => $this->renderDividerBlock($props),
                'product' => $this->renderProductBlock($props),
                'product_grid' => $this->renderProductGridBlock($props),
                'order_summary' => $this->renderOrderSummaryBlock($props),
                'coupon' => $this->renderCouponBlock($props),
                'hero_banner' => $this->renderHeroBannerBlock($props),
                'spacer' => $this->renderSpacerBlock($props),
                'social_links' => $this->renderSocialLinksBlock($props),
                'footer' => $this->renderFooterBlock($props),
                default => "<p style=\"color: #cbd5e1; margin: 0 0 14px 0;\">" . ($props['content'] ?? '') . "</p>",
            };
        }

        return $html;
    }

    protected function renderLogoBlock(array $p): string
    {
        $align = $p['align'] ?? 'center';
        $width = $p['width'] ?? '160';
        $src = $p['src'] ?? '/logo.png';
        $alt = $p['alt'] ?? 'TechMarket BD';
        $url = $p['url'] ?? config('app.url', 'http://localhost');

        return "<div style=\"text-align: {$align}; margin-bottom: 20px;\"><a href=\"{$url}\" target=\"_blank\"><img src=\"{$src}\" alt=\"{$alt}\" width=\"{$width}\" style=\"max-width: 100%; height: auto; border: 0;\"></a></div>";
    }

    protected function renderHeadingBlock(array $p): string
    {
        $color = $p['color'] ?? '#ffffff';
        $size = $p['size'] ?? '20px';
        $align = $p['align'] ?? 'left';
        $content = $p['content'] ?? '';
        $tag = $p['level'] ?? 'h2';

        return "<{$tag} style=\"color: {$color}; font-size: {$size}; font-weight: 800; text-align: {$align}; margin: 0 0 14px 0; line-height: 1.3;\">{$content}</{$tag}>";
    }

    protected function renderTextBlock(array $p): string
    {
        $color = $p['color'] ?? '#cbd5e1';
        $size = $p['size'] ?? '14px';
        $align = $p['align'] ?? 'left';
        $content = nl2br($p['content'] ?? '');

        return "<p style=\"color: {$color}; font-size: {$size}; text-align: {$align}; line-height: 1.6; margin: 0 0 16px 0;\">{$content}</p>";
    }

    protected function renderImageBlock(array $p): string
    {
        $src = $p['src'] ?? '';
        $alt = $p['alt'] ?? '';
        $url = $p['url'] ?? '';
        $align = $p['align'] ?? 'center';
        $radius = $p['radius'] ?? '8px';

        $img = "<img src=\"{$src}\" alt=\"{$alt}\" style=\"max-width: 100%; border-radius: {$radius}; display: inline-block; border: 0;\">";
        if (!empty($url)) {
            $img = "<a href=\"{$url}\" target=\"_blank\" style=\"text-decoration: none;\">{$img}</a>";
        }

        return "<div style=\"text-align: {$align}; margin: 16px 0;\">{$img}</div>";
    }

    protected function renderButtonBlock(array $p): string
    {
        $align = $p['align'] ?? 'center';
        $url = $p['url'] ?? '#';
        $label = $p['label'] ?? 'Click Here';
        $bgColor = $p['bg_color'] ?? '#f59e0b';
        $textColor = $p['text_color'] ?? '#0f172a';
        $radius = $p['radius'] ?? '10px';
        $padding = $p['padding'] ?? '12px 28px';

        return "<div style=\"text-align: {$align}; margin: 24px 0;\"><a href=\"{$url}\" target=\"_blank\" style=\"display: inline-block; padding: {$padding}; background-color: {$bgColor}; color: {$textColor}; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: {$radius}; letter-spacing: 0.2px;\">{$label}</a></div>";
    }

    protected function renderDividerBlock(array $p): string
    {
        $color = $p['color'] ?? '#334155';
        $margin = $p['margin'] ?? '20px 0';

        return "<hr style=\"border: 0; border-top: 1px solid {$color}; margin: {$margin};\">";
    }

    protected function renderProductBlock(array $p): string
    {
        $title = $p['title'] ?? '{{product_name}}';
        $price = $p['price'] ?? '৳{{order_total}}';
        $image = $p['image'] ?? '{{product_image}}';
        $url = $p['url'] ?? '{{site_url}}';

        return <<<HTML
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; margin: 16px 0; overflow: hidden;">
  <tr>
    <td width="100" style="padding: 12px; text-align: center; vertical-align: middle;">
      <img src="{$image}" alt="{$title}" width="80" style="max-width: 80px; height: auto; border-radius: 8px;">
    </td>
    <td style="padding: 12px 16px; vertical-align: middle;">
      <div style="font-weight: 700; color: #f8fafc; font-size: 14px; margin-bottom: 4px;">{$title}</div>
      <div style="color: #f59e0b; font-weight: 800; font-size: 15px;">{$price}</div>
    </td>
    <td width="100" style="padding: 12px; text-align: right; vertical-align: middle;">
      <a href="{$url}" target="_blank" style="display: inline-block; padding: 8px 14px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 700; font-size: 11px; border-radius: 6px;">Buy Now</a>
    </td>
  </tr>
</table>
HTML;
    }

    protected function renderProductGridBlock(array $p): string
    {
        $products = $p['products'] ?? [
            ['title' => 'Gaming Processor', 'price' => '৳32,000', 'url' => '#'],
            ['title' => 'RGB RAM 16GB', 'price' => '৳7,500', 'url' => '#'],
        ];

        $itemsHtml = '';
        foreach ($products as $prod) {
            $t = $prod['title'] ?? 'Product';
            $pr = $prod['price'] ?? '৳0';
            $u = $prod['url'] ?? '#';

            $itemsHtml .= <<<HTML
<td width="50%" style="padding: 8px; vertical-align: top;">
  <div style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; text-align: center;">
    <div style="font-weight: 700; color: #f8fafc; font-size: 13px; margin-bottom: 6px;">{$t}</div>
    <div style="color: #f59e0b; font-weight: 800; font-size: 14px; margin-bottom: 10px;">{$pr}</div>
    <a href="{$u}" target="_blank" style="display: inline-block; padding: 6px 14px; background-color: #38bdf8; color: #0f172a; text-decoration: none; font-weight: 700; font-size: 11px; border-radius: 6px;">View Details</a>
  </div>
</td>
HTML;
        }

        return "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin: 16px 0;\"><tr>{$itemsHtml}</tr></table>";
    }

    protected function renderOrderSummaryBlock(array $p): string
    {
        return <<<HTML
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 12px; margin: 18px 0; overflow: hidden;">
  <tr style="background-color: #1e293b; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase;">
    <th align="left" style="padding: 10px 14px;">Item / Description</th>
    <th align="right" style="padding: 10px 14px;">Total</th>
  </tr>
  <tr>
    <td style="padding: 12px 14px; border-top: 1px solid #1e293b; color: #e2e8f0; font-size: 13px;">
      Order #<strong>{{order_number}}</strong> Summary
    </td>
    <td align="right" style="padding: 12px 14px; border-top: 1px solid #1e293b; font-weight: 800; color: #f59e0b; font-size: 14px;">
      ৳{{order_total}}
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding: 10px 14px; background-color: #080c14; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8;">
      Delivery Address: <span style="color: #cbd5e1;">{{delivery_address}}</span>
    </td>
  </tr>
</table>
HTML;
    }

    protected function renderCouponBlock(array $p): string
    {
        $code = $p['code'] ?? 'TECH2026';
        $discount = $p['discount'] ?? '10% OFF';
        $note = $p['note'] ?? 'Valid on all online checkout orders';

        return <<<HTML
<div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
  <div style="font-size: 12px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Exclusive Discount</div>
  <div style="font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">{$discount}</div>
  <div style="display: inline-block; padding: 6px 18px; background-color: #0b0f19; border: 1px solid #f59e0b; color: #f59e0b; font-family: monospace; font-size: 16px; font-weight: 800; border-radius: 8px; letter-spacing: 2px;">{$code}</div>
  <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">{$note}</div>
</div>
HTML;
    }

    protected function renderHeroBannerBlock(array $p): string
    {
        $title = $p['title'] ?? 'Level Up Your Battlestation';
        $subtitle = $p['subtitle'] ?? 'Exclusive Discounts on High Performance Gaming Rigs';
        $btnLabel = $p['button_label'] ?? 'Explore Deals';
        $btnUrl = $p['button_url'] ?? config('app.url', 'http://localhost') . '/catalog';
        $bg = $p['bg_color'] ?? '#1e1b4b';

        return <<<HTML
<div style="background-color: {$bg}; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 18px 0; border: 1px solid #312e81;">
  <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 8px 0; line-height: 1.2;">{$title}</h1>
  <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">{$subtitle}</p>
  <a href="{$btnUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 10px;">{$btnLabel}</a>
</div>
HTML;
    }

    protected function renderSpacerBlock(array $p): string
    {
        $height = $p['height'] ?? '20px';
        return "<div style=\"height: {$height}; line-height: {$height}; font-size: 1px;\">&nbsp;</div>";
    }

    protected function renderSocialLinksBlock(array $p): string
    {
        $links = $p['links'] ?? [
            ['name' => 'Facebook', 'url' => 'https://facebook.com'],
            ['name' => 'YouTube', 'url' => 'https://youtube.com'],
            ['name' => 'Instagram', 'url' => 'https://instagram.com'],
        ];

        $html = '<div style="text-align: center; margin: 20px 0;">';
        foreach ($links as $l) {
            $name = $l['name'] ?? 'Social';
            $url = $l['url'] ?? '#';
            $html .= "<a href=\"{$url}\" target=\"_blank\" style=\"display: inline-block; margin: 0 8px; color: #38bdf8; text-decoration: none; font-weight: 600; font-size: 12px;\">{$name}</a>";
        }
        $html .= '</div>';
        return $html;
    }

    protected function renderFooterBlock(array $p): string
    {
        $text = $p['text'] ?? "You are receiving this email because you registered on TechMarket BD.";
        $unsub = $p['include_unsubscribe'] ?? true;
        $unsubHtml = $unsub ? "<p style=\"margin: 6px 0 0 0;\"><a href=\"{{unsubscribe_url}}\" style=\"color: #94a3b8; text-decoration: underline;\">Unsubscribe from promotional emails</a></p>" : '';

        return <<<HTML
<div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #64748b;">
  <p style="margin: 0;">{$text}</p>
  {$unsubHtml}
</div>
HTML;
    }
}
