import React, { useState } from 'react';
import { MessageSquareWarning, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function Feedback() {
  const [type, setType] = useState('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    setSuccess(false);

    try {
      await addDoc(collection(db, 'feedbacks'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || '',
        type,
        title,
        description,
        status: 'new',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
      <div className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-stone-200 shadow-sm space-y-6 lg:space-y-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 lg:pb-6">
          <MessageSquareWarning className="w-5 h-5 lg:w-6 lg:h-6 text-amber-500" />
          <h3 className="text-xl lg:text-2xl font-bold text-stone-900">Báo lỗi & Góp ý</h3>
        </div>
        
        <p className="text-stone-500 text-sm">
          Chúng tôi luôn trân trọng mọi ý kiến đóng góp của bạn để EventCheck ngày càng hoàn thiện hơn.
        </p>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">Cảm ơn bạn! Báo cáo của bạn đã được gửi thành công.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Loại báo cáo</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="bug" 
                  checked={type === 'bug'}
                  onChange={() => setType('bug')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700">Báo lỗi hệ thống</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="feature" 
                  checked={type === 'feature'}
                  onChange={() => setType('feature')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700">Đề xuất tính năng mới</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Tiêu đề</label>
            <input
              required
              type="text"
              placeholder="VD: Không thể gửi email cho khách mời"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Mô tả chi tiết</label>
            <textarea
              required
              rows={6}
              placeholder="Vui lòng mô tả chi tiết lỗi bạn gặp phải hoặc ý tưởng về tính năng mới..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-70 text-sm lg:text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Gửi báo cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
