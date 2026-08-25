import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminShell from '../../../Components/Admin/AdminShell';
import AdminPageHeader from '../../../Components/Admin/AdminPageHeader';
import AdminTable from '../../../Components/Admin/AdminTable';
import AdminStatusBadge from '../../../Components/Admin/AdminStatusBadge';
import AdminModal from '../../../Components/Admin/AdminModal';
import ConfirmDialog from '../../../Components/Admin/ConfirmDialog';
import { HelpCircle, CheckCircle, Trash2, MessageSquare } from 'lucide-react';

export default function AdminQuestions({ questions = { data: [] } }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [density, setDensity] = useState('comfortable');

  const questionList = Array.isArray(questions?.data) ? questions.data : [];

  const { data, setData, post, processing, reset } = useForm({
    answer: '',
    status: 'approved',
  });

  const openAnswerModal = (q) => {
    setSelectedQuestion(q);
    setData({
      answer: q.answer || '',
      status: 'approved',
    });
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    post(`/admin/questions/${selectedQuestion.id}/answer`, {
      onSuccess: () => {
        setSelectedQuestion(null);
        reset();
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/questions/${deleteTarget.id}`, {
      onFinish: () => setDeleteTarget(null),
    });
  };

  const columns = [
    {
      header: 'Hardware Product',
      accessor: 'product',
      render: (q) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-heading">
            {q.product?.title || 'Unknown Item'}
          </div>
          <div className="text-[10.5px] text-slate-400 font-mono">
            SKU: {q.product?.sku || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Pre-Sales Question',
      accessor: 'question',
      render: (q) => (
        <div className="max-w-md space-y-1">
          <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
            {q.question}
          </p>
          <div className="text-[10px] text-slate-400 font-mono">
            Asked by: {q.user?.name || 'Customer'} • {q.created_at ? new Date(q.created_at).toLocaleDateString() : 'Recent'}
          </div>
        </div>
      ),
    },
    {
      header: 'Official Answer',
      accessor: 'answer',
      render: (q) => (
        <div className="max-w-sm">
          {q.answer ? (
            <div className="p-2 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-medium">
              {q.answer}
            </div>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">
              — Awaiting Reply —
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (q) => (
        <AdminStatusBadge
          status={q.status === 'approved' ? 'active' : 'pending'}
          label={q.status || 'Pending'}
          size="xs"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (q) => (
        <div className="flex items-center justify-end space-x-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => openAnswerModal(q)}
            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
            title="Answer Question"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Answer</span>
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(q)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Delete Question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Product Questions">
      <Head title="Product Q&A Moderation - TechMarket Admin" />

      <div className="space-y-5">
        {/* Page Header */}
        <AdminPageHeader
          title="Product Q&A & Technical Inquiries"
          subtitle="Respond to customer compatibility and technical specification questions published on product pages."
          badge={`${questions.total || questionList.length} Questions`}
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          data={questionList}
          pagination={questions}
          density={density}
          onDensityChange={setDensity}
          emptyTitle="No customer questions submitted"
          emptyDescription="Customer pre-sales inquiries will appear here for staff moderation and answers."
        />
      </div>

      {/* Answer Modal */}
      {selectedQuestion && (
        <AdminModal
          isOpen={Boolean(selectedQuestion)}
          onClose={() => setSelectedQuestion(null)}
          title="Answer Technical Inquiry"
          subtitle={selectedQuestion.product?.title || 'Product Question'}
          icon={HelpCircle}
          size="md"
          footer={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAnswerSubmit}
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {processing ? 'Publishing...' : 'Publish Answer'}
              </button>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase font-mono">Customer Inquiry:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">"{selectedQuestion.question}"</p>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Official Technical Response *</label>
              <textarea
                rows={4}
                required
                placeholder="Provide accurate specifications and warranty details..."
                value={data.answer}
                onChange={(e) => setData('answer', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Question"
        message="Are you sure you want to permanently delete this customer question?"
        confirmText="Delete Question"
        isDestructive
      />
    </AdminShell>
  );
}
