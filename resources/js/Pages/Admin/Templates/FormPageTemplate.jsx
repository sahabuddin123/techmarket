import React from 'react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import { AdminFormActions } from '../../../Components/Admin/AdminFormSection';

export default function FormPageTemplate({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  backUrl,
  onSubmit,
  onSave,
  onSaveAndContinue,
  onDraft,
  onCancel,
  cancelHref,
  saveLabel = 'Save Changes',
  saving = false,
  children,
}) {
  return (
    <AdminShell title={title} breadcrumbs={breadcrumbs}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Page Header */}
        <AdminPageHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          backUrl={backUrl}
        />

        {/* Form Sections */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Sticky Action Footer */}
        <AdminFormActions
          onSave={onSave}
          onSaveAndContinue={onSaveAndContinue}
          onDraft={onDraft}
          onCancel={onCancel}
          cancelHref={cancelHref || backUrl}
          saveLabel={saveLabel}
          saving={saving}
        />
      </form>
    </AdminShell>
  );
}
