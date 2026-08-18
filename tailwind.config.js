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
                sans: ['Poppins', 'Inter', ...defaultTheme.fontFamily.sans],
                poppins: ['Poppins', 'Inter', ...defaultTheme.fontFamily.sans],
                heading: ['Poppins', '"Plus Jakarta Sans"', 'Inter', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                brand: {
                    DEFAULT: '#1c4289',
                    dark: '#15326b',
                    light: '#2a55a8',
                    price: '#dc2626',
                    buy: '#22c55e',
                    'buy-hover': '#16a34a',
                },
                admin: {
                    bg: '#090d16',
                    card: '#0f172a',
                    cardHover: '#131e35',
                    border: '#1e293b',
                    borderLight: '#334155',
                    accent: '#f59e0b',
                    accentHover: '#d97706',
                    primary: '#3b82f6',
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    muted: '#64748b',
                }
            }
        },
    },

    plugins: [forms],
};
