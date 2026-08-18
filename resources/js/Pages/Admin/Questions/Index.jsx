import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../AdminLayout';
import { HelpCircle, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminQuestions({ questions }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

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

  const handleDelete = (id) => {
    if (confirm('Delete this question?')) {
      router.delete(`/admin/questions/${id}`);
    }
  };

  return (
    <AdminLayout title="Product Questions Moderation">
      <Head title="Product Q&A - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-amber-500" />
            <span>PRODUCT Q&A & TECH SUPPORT MODERATION</span>
          </h1>
          <p className="text-xs text-slate-400">Answer customer technical inquiry questions and publish them to public product pages.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800">
                  <th className="p-3.5">Product Title</th>
                  <th className="p-3.5">Customer Inquiry Question</th>
                  <th className="p-3.5">Admin Answer</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {questions.data && questions.data.length > 0 ? (
                  questions.data.map(q => (
                    <tr key={q.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white max-w-xs">{q.product?.title}</td>
                      <td className="p-3.5 max-w-sm text-slate-200">{q.question}</td>
                      <td className="p-3.5 max-w-sm text-amber-300 font-semibold">{q.answer || '— Pending Answer —'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          q.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button onClick={() => openAnswerModal(q)} className="p-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded" title="Answer Question">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-1 bg-slate-800 text-slate-400 hover:text-rose-400 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No customer questions submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ANSWER MODAL */}
        {selectedQuestion && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleAnswerSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Answer Tech Inquiry</h3>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 font-semibold">
                "{selectedQuestion.question}"
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Official Response / Answer *</label>
                <textarea
                  rows={3}
                  required
                  value={data.answer}
                  onChange={(e) => setData('answer', e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-2.5 rounded border border-slate-800 focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setSelectedQuestion(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-bold">Cancel</button>
                <button type="submit" disabled={processing} className="px-4 py-2 bg-amber-500 text-slate-950 rounded font-black uppercase">Publish Answer</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
