import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--admin-font-family)', 'Inter', 'Poppins', ...defaultTheme.fontFamily.sans],
                poppins: ['Poppins', 'Inter', ...defaultTheme.fontFamily.sans],
                heading: ['var(--admin-font-heading)', 'Inter', '"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                mono: ['var(--admin-font-mono)', '"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
                admin: ['var(--admin-font-family)', 'Inter', ...defaultTheme.fontFamily.sans],
                adminHeading: ['var(--admin-font-heading)', 'Inter', ...defaultTheme.fontFamily.sans],
                adminMono: ['var(--admin-font-mono)', '"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                brand: {
                    DEFAULT: '#0084ff',
                    dark: '#006edc',
                    light: '#e0f2fe',
                    navy: '#0b1320',
                    price: '#dc2626',
                    buy: '#0084ff',
                    'buy-hover': '#0070d6',
                },
                admin: {
                    bg: 'var(--admin-bg, #f8fafc)',
                    surface: 'var(--admin-surface, #ffffff)',
                    card: 'var(--admin-surface, #ffffff)',
                    sidebar: 'var(--admin-sidebar, #ffffff)',
                    header: 'var(--admin-header, #ffffff)',
                    border: 'var(--admin-border, #e2e8f0)',
                    text: 'var(--admin-text, #0f172a)',
                    secondary: 'var(--admin-text-secondary, #475569)',
                    muted: 'var(--admin-text-muted, #64748b)',
                    primary: 'var(--admin-primary, #4f46e5)',
                    primaryHover: 'var(--admin-primary-hover, #4338ca)',
                    accent: 'var(--admin-accent, #8b5cf6)',
                    success: 'var(--admin-success, #10b981)',
                    warning: 'var(--admin-warning, #f59e0b)',
                    danger: 'var(--admin-danger, #ef4444)',
                    info: 'var(--admin-info, #3b82f6)',
                }
            },
            borderRadius: {
                'admin': 'var(--admin-radius, 12px)',
            }
        },
    },

    plugins: [forms],
};
