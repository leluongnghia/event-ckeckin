import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, Search, Clock } from 'lucide-react';
import { collection, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import axios from 'axios';
import PageGuide from '../components/PageGuide';

interface Attendee {
  id: string;
  name: string;
  email: string;
  emailSent?: boolean;
}

export default function EmailCampaign() {
  const { eventId = 'default-event' } = useParams();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const path = `events/${eventId}/attendees`;
    const q = query(collection(db, path));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Attendee[];
      setAttendees(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  const sendEmails = async () => {
    const unsent = attendees.filter(a => !a.emailSent);
    if (unsent.length === 0) {
      alert("Tất cả khách mời đã được gửi email.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn gửi email cho ${unsent.length} khách mời chưa nhận được vé?`)) {
      return;
    }

    setSending(true);
    setStatus('idle');

    try {
      // Call backend API for batch sending
      await axios.post('/api/email/send-batch', { attendees: unsent, eventId });

      // Update Firestore to mark as sent
      for (const attendee of unsent) {
        const path = `events/${eventId}/attendees/${attendee.id}`;
        await updateDoc(doc(db, path), {
          emailSent: true,
          emailSentAt: new Date()
        });
      }
      
      setStatus('success');
      setErrorMessage('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      console.error("Failed to send emails", error);
      setStatus('error');
      setErrorMessage(error.response?.data?.error || "Lỗi không xác định khi gọi API");
    } finally {
      setSending(false);
    }
  };

  const filteredAttendees = attendees.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PageGuide 
        title="Gửi Email Vé Mời Hàng Loạt"
        description="Phát hành vé điện tử qua Email cho toàn bộ khách hàng chỉ với 1 thao tác. Hệ thống tự động nhận diện và chỉ gửi cho những ai chưa từng nhận vé."
      />
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-stone-900">Chiến dịch gửi vé mời</h3>
          <p className="text-stone-500">Gửi email hàng loạt chứa mã QR cho các khách mời đã đăng ký.</p>
        </div>
        <button
          onClick={sendEmails}
          disabled={sending}
          className="flex items-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {sending ? 'Đang gửi...' : 'Gửi vé ngay'}
        </button>
      </div>

      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <p className="font-medium">Chiến dịch đã hoàn thành thành công!</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">Thất bại: {errorMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h4 className="font-semibold text-stone-800">Danh sách gửi ({attendees.length})</h4>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm khách mời..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-stone-50 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Khách mời</th>
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase">Trạng thái gửi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.id}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-stone-900">{attendee.name}</p>
                      <p className="text-xs text-stone-500">{attendee.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {attendee.emailSent ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Đã gửi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-stone-400 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          Chờ gửi
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
