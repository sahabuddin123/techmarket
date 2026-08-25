import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { ADMIN_NAV_ITEMS, ADMIN_GROUP_DEFINITIONS } from '../Core/Navigation/adminNavigationRegistry';

/**
 * Custom hook to filter navigation items based on current authenticated user's
 * roles, permissions, and active route state.
 */
export function useAdminNavigation() {
  const { props, url: pageUrl } = usePage();
  const auth = props?.auth || {};
  const user = auth?.user || {};
  const currentPath = pageUrl || (typeof window !== 'undefined' ? window.location.pathname : '') || '';

  const userRole = (user?.role || '').toLowerCase();
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const isSuperAdmin = userRole === 'admin' || userRole === 'superadmin' || user?.is_super_admin === true;

  const accessibleSections = useMemo(() => {
    // Determine which items the user can access
    const allowedItems = ADMIN_NAV_ITEMS.filter((item) => {
      // Super admin can access everything
      if (isSuperAdmin) return true;

      // If user has specific permission
      if (item.permission && userPermissions.includes(item.permission)) {
        return true;
      }

      // Role-based heuristics for standard enterprise profiles
      if (userRole === 'sales') {
        return ['overview', 'sales', 'customers'].includes(item.group) || item.id === 'products';
      }
      if (userRole === 'warehouse') {
        return ['overview', 'inventory', 'operations'].includes(item.group) || item.id === 'products';
      }
      if (userRole === 'finance') {
        return ['overview', 'sales', 'operations', 'reporting'].includes(item.group) || item.id === 'payments';
      }
      if (userRole === 'marketing') {
        return ['overview', 'marketing', 'promotions', 'storefront', 'catalog'].includes(item.group);
      }
      if (userRole === 'cctv_manager' || userRole === 'cctv') {
        return item.group === 'cctv' || item.id === 'dashboard';
      }
      if (userRole === 'technician') {
        return ['cctv_installations', 'cctv_surveys', 'cctv_service_requests', 'cctv_installed_equipment'].includes(item.id);
      }

      // Default fallback: allow basic dashboard
      return item.id === 'dashboard';
    });

    // Group items into their respective sections
    const grouped = ADMIN_GROUP_DEFINITIONS.map((groupDef) => {
      const itemsInGroup = allowedItems
        .filter((item) => item.group === groupDef.key)
        .sort((a, b) => a.order - b.order);

      return {
        key: groupDef.key,
        title: groupDef.title,
        order: groupDef.order,
        items: itemsInGroup,
      };
    }).filter((group) => group.items.length > 0);

    return grouped;
  }, [userRole, userPermissions, isSuperAdmin]);

  // Helper to check if a route is active
  const isRouteActive = (routeHref) => {
    if (routeHref === '/admin') {
      return currentPath === '/admin' || currentPath === '/admin/dashboard';
    }
    return currentPath === routeHref || currentPath.startsWith(routeHref + '/');
  };

  return {
    sections: accessibleSections,
    currentPath,
    isRouteActive,
    user,
    isSuperAdmin,
  };
}
