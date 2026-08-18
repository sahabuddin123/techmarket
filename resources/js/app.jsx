import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { router } from '@inertiajs/react';
import { initTracking, trackPageView } from './lib/tracking';

const appName = import.meta.env.VITE_APP_NAME || 'TechMarket BD';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        if (props?.initialPage?.props?.tracking) {
            initTracking(props.initialPage.props.tracking);
        }

        // Automated page view tracking on router transitions
        router.on('navigate', (event) => {
            trackPageView(event.detail.page.url);
        });

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#f59e0b',
    },
});
