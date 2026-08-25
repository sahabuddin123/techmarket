import React from 'react';
import AdminShell from '../../Components/Admin/AdminShell';

/**
 * Compatibility wrapper for AdminLayout -> AdminShell
 */
export default function AdminLayout({ children, title, breadcrumbs = [] }) {
  return (
    <AdminShell title={title} breadcrumbs={breadcrumbs}>
      {children}
    </AdminShell>
  );
}
