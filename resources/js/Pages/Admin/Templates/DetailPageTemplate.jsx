import React from 'react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTabs from '../../../Components/Admin/AdminTabs';

export default function DetailPageTemplate({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  backUrl,
  headerActions,
  kpis = [],
  tabs = [],
  activeTab,
  onTabChange,
  children,
}) {
  return (
    <AdminShell title={title} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          backUrl={backUrl}
          actions={headerActions}
        />

        {/* Optional KPI Summary Row */}
        {kpis && kpis.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis}
          </div>
        )}

        {/* Tab Navigation if provided */}
        {tabs && tabs.length > 0 && (
          <AdminTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={onTabChange}
          />
        )}

        {/* Detail Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </AdminShell>
  );
}
