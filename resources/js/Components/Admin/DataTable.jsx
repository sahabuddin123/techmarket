import React from 'react';
import AdminTable from './AdminTable';

/**
 * Compatibility wrapper for DataTable -> AdminTable
 */
export default function DataTable(props) {
  return <AdminTable {...props} />;
}
