import React from 'react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminPageToolbar from '../../../Components/Admin/AdminPageToolbar';
import AdminTable from '../../../Components/Admin/AdminTable';

export default function ListPageTemplate({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  headerActions,
  search,
  onSearchChange,
  searchPlaceholder,
  filtersActiveCount,
  onToggleFilters,
  sortOptions,
  currentSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  bulkSelectionCount,
  bulkActions,
  onExport,
  onImport,
  onRefresh,
  createLabel,
  onCreateClick,
  createHref,
  columns = [],
  data = [],
  pagination,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  idKey = 'id',
  sortBy,
  sortDirection,
  onSort,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  density,
  onDensityChange,
  children,
}) {
  return (
    <AdminShell title={title} breadcrumbs={breadcrumbs}>
      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          actions={headerActions}
        />

        {/* Universal Page Toolbar */}
        <AdminPageToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          filtersActiveCount={filtersActiveCount}
          onToggleFilters={onToggleFilters}
          sortOptions={sortOptions}
          currentSort={currentSort}
          onSortChange={onSortChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          bulkSelectionCount={bulkSelectionCount}
          bulkActions={bulkActions}
          onExport={onExport}
          onImport={onImport}
          onRefresh={onRefresh}
          createLabel={createLabel}
          onCreateClick={onCreateClick}
          createHref={createHref}
        />

        {/* Main Table or Custom Grid Content */}
        {children || (
          <AdminTable
            columns={columns}
            data={data}
            pagination={pagination}
            loading={loading}
            selectable={selectable}
            selectedIds={selectedIds}
            onSelectChange={onSelectChange}
            idKey={idKey}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyAction={emptyAction}
            onRowClick={onRowClick}
            density={density}
            onDensityChange={onDensityChange}
          />
        )}
      </div>
    </AdminShell>
  );
}
