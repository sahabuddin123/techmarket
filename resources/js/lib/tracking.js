/**
 * Centralized Ecommerce Marketing & Analytics Tracking Engine
 * TechMarket BD — Supports Google Analytics 4, Google Tag Manager & Meta Pixel / CAPI
 */

export const getCanonicalContentId = (product) => {
  if (!product) return '';
  if (typeof product === 'object') {
    const id = product.id || product.product_id;
    return id ? `PRODUCT_${id}` : (product.sku ? `SKU_${product.sku}` : '');
  }
  return `PRODUCT_${product}`;
};

// Generate unique event ID for browser Pixel and server CAPI deduplication
export const generateEventId = (prefix = 'EVT') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

let trackingInitialized = false;

export const initTracking = (trackingConfig = {}) => {
  if (typeof window === 'undefined' || trackingInitialized) return;

  const {
    ga4_enabled,
    ga4_measurement_id,
    gtm_enabled,
    gtm_container_id,
    meta_pixel_enabled,
    meta_pixel_id,
  } = trackingConfig;

  // 1. Google Tag Manager (GTM)
  if (gtm_enabled && gtm_container_id && !window.__gtm_loaded) {
    window.__gtm_loaded = true;
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',gtm_container_id);
  }

  // 2. Google Analytics 4 (GA4) Direct Script
  if (ga4_enabled && ga4_measurement_id && !gtm_enabled && !window.__ga4_loaded) {
    window.__ga4_loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga4_measurement_id, {
      send_page_view: false, // Managed dynamically by Inertia router
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4_measurement_id}`;
    document.head.appendChild(script);
  }

  // 3. Meta Pixel (Browser)
  if (meta_pixel_enabled && meta_pixel_id && !window.__fbq_loaded) {
    window.__fbq_loaded = true;
    (function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)})(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', meta_pixel_id);
  }

  trackingInitialized = true;
};

// Internal database logging disabled to keep local MySQL database lightweight & ultra fast.
// All events are streamed directly to Google Analytics 4, GTM dataLayer & Meta Pixel in the cloud.
const logInternalEvent = () => {};

/**
 * 1. Track Page View
 */
export const trackPageView = (url = window.location.pathname, title = document.title) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_location: window.location.href,
    page_path: url,
    page_title: title,
  });

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: url,
      page_title: title,
    });
  }

  if (window.fbq) {
    window.fbq('track', 'PageView');
  }

  logInternalEvent({
    event_name: 'page_view',
    metadata: { url, title },
  });
};

/**
 * 2. Track Product View (ViewContent)
 */
export const trackViewContent = (product) => {
  if (!product || typeof window === 'undefined') return;

  const contentId = getCanonicalContentId(product);
  const price = Number(product.price || 0);
  const eventId = generateEventId('VIEW');
  const items = [{
    item_id: contentId,
    item_name: product.title,
    price: price,
    item_category: product.category?.name || 'Hardware',
    item_brand: product.brand?.name || 'TechMarket',
  }];

  // GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'view_item',
    ecommerce: {
      currency: 'BDT',
      value: price,
      items: items,
    }
  });

  // GA4
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'BDT',
      value: price,
      items: items,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [contentId],
      content_name: product.title,
      content_type: 'product',
      content_category: product.category?.name || 'Hardware',
      value: price,
      currency: 'BDT',
    }, { eventID: eventId });
  }

  logInternalEvent({
    event_name: 'view_content',
    event_id: eventId,
    content_id: contentId,
    product_id: product.id,
    value: price,
    metadata: { title: product.title, category: product.category?.name },
  });
};

/**
 * 3. Track Search Query
 */
export const trackSearch = (searchQuery) => {
  if (!searchQuery || typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'search',
    search_term: searchQuery,
  });

  if (window.gtag) {
    window.gtag('event', 'search', { search_term: searchQuery });
  }

  if (window.fbq) {
    window.fbq('track', 'Search', { search_string: searchQuery });
  }

  logInternalEvent({
    event_name: 'search',
    metadata: { query: searchQuery },
  });
};

/**
 * 4. Track Category View
 */
export const trackViewCategory = (category) => {
  if (!category || typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'view_item_list',
    item_list_name: category.name,
    category_id: category.id,
  });

  if (window.gtag) {
    window.gtag('event', 'view_item_list', { item_list_name: category.name });
  }

  if (window.fbq) {
    window.fbq('trackCustom', 'ViewCategory', { content_category: category.name });
  }

  logInternalEvent({
    event_name: 'view_category',
    category_id: category.id,
    metadata: { name: category.name },
  });
};

/**
 * 5. Track Add To Cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (!product || typeof window === 'undefined') return;

  const contentId = getCanonicalContentId(product);
  const price = Number(product.price || 0);
  const totalValue = price * quantity;
  const eventId = generateEventId('ATC');
  const items = [{
    item_id: contentId,
    item_name: product.title,
    price: price,
    quantity: quantity,
  }];

  // GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'BDT',
      value: totalValue,
      items: items,
    }
  });

  // GA4
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'BDT',
      value: totalValue,
      items: items,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [contentId],
      content_name: product.title,
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
    }, { eventID: eventId });
  }

  logInternalEvent({
    event_name: 'add_to_cart',
    event_id: eventId,
    content_id: contentId,
    product_id: product.id,
    value: totalValue,
    metadata: { quantity, title: product.title },
  });
};

/**
 * 6. Track Remove From Cart
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  if (!product || typeof window === 'undefined') return;

  const contentId = getCanonicalContentId(product);
  const price = Number(product.price || 0);
  const items = [{
    item_id: contentId,
    item_name: product.title,
    price: price,
    quantity: quantity,
  }];

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'remove_from_cart',
    ecommerce: {
      currency: 'BDT',
      value: price * quantity,
      items: items,
    }
  });

  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'BDT',
      value: price * quantity,
      items: items,
    });
  }

  logInternalEvent({
    event_name: 'remove_from_cart',
    content_id: contentId,
    product_id: product.id,
  });
};

/**
 * 7. Track Initiate Checkout
 */
export const trackInitiateCheckout = (cartItems = [], total = 0) => {
  if (typeof window === 'undefined') return;

  const contentIds = cartItems.map(getCanonicalContentId);
  const eventId = generateEventId('CHK');
  const items = cartItems.map(item => ({
    item_id: getCanonicalContentId(item.product || item),
    item_name: item.product?.title || item.title,
    price: Number(item.price),
    quantity: item.quantity,
  }));

  // GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'BDT',
      value: Number(total),
      items: items,
    }
  });

  // GA4
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'BDT',
      value: Number(total),
      items: items,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      content_type: 'product',
      value: Number(total),
      currency: 'BDT',
      num_items: cartItems.length,
    }, { eventID: eventId });
  }

  logInternalEvent({
    event_name: 'initiate_checkout',
    event_id: eventId,
    value: Number(total),
    metadata: { num_items: cartItems.length },
  });
};

/**
 * 8. Track Add Payment Info
 */
export const trackAddPaymentInfo = (paymentMethod, total = 0) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'add_payment_info',
    payment_type: paymentMethod,
    currency: 'BDT',
    value: Number(total),
  });

  if (window.gtag) {
    window.gtag('event', 'add_payment_info', {
      payment_type: paymentMethod,
      currency: 'BDT',
      value: Number(total),
    });
  }

  if (window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      currency: 'BDT',
      value: Number(total),
    });
  }
};

/**
 * 9. Track Authoritative Order Purchase (with Deduplication)
 */
export const trackPurchase = (order) => {
  if (!order || typeof window === 'undefined') return;

  const orderNumber = order.order_number || order.id;
  const dedupKey = `tm_tracked_purchase_${orderNumber}`;

  // Prevent duplicate firing on page refresh
  if (sessionStorage.getItem(dedupKey)) {
    return;
  }

  const items = order.items || [];
  const contentIds = items.map(item => getCanonicalContentId(item.product || item));
  const stableEventId = `PURCHASE_${orderNumber}`;
  const totalValue = Number(order.total || 0);
  const formattedItems = items.map(item => ({
    item_id: getCanonicalContentId(item.product || item),
    item_name: item.product_name || item.product?.title || 'Hardware Item',
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
  }));

  // GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: {
      transaction_id: String(orderNumber),
      value: totalValue,
      currency: 'BDT',
      shipping: Number(order.shipping_cost || 0),
      items: formattedItems,
    }
  });

  // GA4
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: String(orderNumber),
      value: totalValue,
      currency: 'BDT',
      shipping: Number(order.shipping_cost || 0),
      items: formattedItems,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: contentIds,
      content_type: 'product',
      value: totalValue,
      currency: 'BDT',
      num_items: items.length,
      order_id: String(orderNumber),
    }, { eventID: stableEventId });
  }

  // Mark as tracked
  sessionStorage.setItem(dedupKey, 'true');

  logInternalEvent({
    event_name: 'purchase',
    event_id: stableEventId,
    value: totalValue,
    metadata: { order_number: orderNumber, num_items: items.length },
  });
};
