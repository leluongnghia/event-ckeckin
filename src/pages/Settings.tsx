import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings as SettingsIcon, Save, Calendar, MapPin, Type, Bell, Loader2, QrCode, CheckCircle2, Mail, FileText, Send, Map as MapIcon, ExternalLink } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { GoogleGenAI } from '@google/genai';

export default function Settings() {
  const { eventId = 'default-event' } = useParams();
  const [eventData, setEventData] = useState({
    name: 'Sự kiện mẫu 2026',
    location: 'Trung tâm Hội nghị Quốc gia',
    startDate: '2026-05-20',
    endDate: '2026-05-21',
    description: 'Hội thảo công nghệ và đổi mới sáng tạo.',
    ticketTitle: 'VÉ MỜI SỰ KIỆN',
    ticketSubtitle: 'EventCheck SaaS Experience',
    ticketColor: '#059669', // emerald-600
    surveyLink: '',
    reportEmail: '',
    telegramBotToken: '',
    telegramChatId: '',
    zaloAccessToken: '',
    zaloTemplateId: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [mapResults, setMapResults] = useState<any[]>([]);
  const [searchingMap, setSearchingMap] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEventData(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching event", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'events', eventId), eventData);
      alert("Đã lưu cài đặt sự kiện thành công!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `events/${eventId}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSendReport = async () => {
    if (!eventData.reportEmail && !auth.currentUser?.email) {
      alert('Vui lòng nhập email nhận báo cáo.');
      return;
    }
    setSendingReport(true);
    try {
      const response = await fetch('/api/event/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventId, 
          targetEmail: eventData.reportEmail || auth.currentUser?.email 
        })
      });
      
      if (response.ok) {
        alert('Báo cáo đã được gửi đến email của bạn!');
      } else {
        throw new Error('Failed to send report');
      }
    } catch (error) {
      console.error("Error sending report:", error);
      alert('Lỗi khi gửi báo cáo. Vui lòng thử lại sau.');
    } finally {
      setSendingReport(false);
    }
  };

  const handleFindNearby = async () => {
    if (!eventData.location) {
      alert("Vui lòng nhập địa điểm sự kiện.");
      return;
    }
    setSearchingMap(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Tìm các địa điểm thú vị gần ${eventData.location}`,
        config: {
          tools: [{ googleMaps: {} }],
        },
      });
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        setMapResults(chunks.filter((c: any) => c.maps).map((c: any) => c.maps));
      } else {
        setMapResults([]);
      }
    } catch (error) {
      console.error("Maps error:", error);
      alert("Lỗi khi tìm kiếm bản đồ.");
    } finally {
      setSearchingMap(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <div className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-stone-200 shadow-sm space-y-6 lg:space-y-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 lg:pb-6">
          <SettingsIcon className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
          <h3 className="text-xl lg:text-2xl font-bold text-stone-900">Cài đặt sự kiện</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Type className="w-4 h-4" /> Tên sự kiện
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={eventData.name || ''}
              onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Ngày bắt đầu
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={eventData.startDate || ''}
              onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Ngày kết thúc
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={eventData.endDate || ''}
              onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Địa điểm
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
                value={eventData.location || ''}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              />
              <button
                onClick={handleFindNearby}
                disabled={searchingMap}
                className="px-4 py-3 bg-stone-100 text-stone-700 rounded-2xl hover:bg-stone-200 transition-all flex items-center gap-2"
              >
                {searchingMap ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapIcon className="w-5 h-5" />}
              </button>
            </div>
            {mapResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-stone-700">Địa điểm gần đó:</p>
                {mapResults.map((m, i) => (
                  <a key={i} href={m.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-stone-50 rounded-xl text-sm text-emerald-700 hover:bg-emerald-50">
                    {m.title}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              Mô tả sự kiện
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={eventData.description || ''}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              Link khảo sát sau sự kiện
            </label>
            <input
              type="url"
              placeholder="https://forms.gle/..."
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={eventData.surveyLink || ''}
              onChange={(e) => setEventData({ ...eventData, surveyLink: e.target.value })}
            />
            <p className="text-[10px] lg:text-xs text-stone-400 italic">Link này sẽ được gửi tự động cho khách mời sau khi sự kiện kết thúc.</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email nhận báo cáo tổng kết
            </label>
            <input
              type="email"
              placeholder="Email sẽ nhận báo cáo sau khi sự kiện kết thúc"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base"
              value={eventData.reportEmail || ''}
              onChange={(e) => setEventData({ ...eventData, reportEmail: e.target.value })}
            />
          </div>

          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-500" />
              <h4 className="text-sm lg:text-base font-bold text-stone-900">Thông báo Telegram (VIP Check-in)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Bot Token</label>
                <input 
                  type="password" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Telegram Bot Token"
                  value={eventData.telegramBotToken || ''}
                  onChange={(e) => setEventData({...eventData, telegramBotToken: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Chat ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Telegram Chat ID"
                  value={eventData.telegramChatId || ''}
                  onChange={(e) => setEventData({...eventData, telegramChatId: e.target.value})}
                />
              </div>
            </div>
            <p className="text-[10px] lg:text-xs text-stone-400 italic">Hệ thống sẽ tự động gửi thông báo đến Telegram khi có khách mời VIP thực hiện check-in.</p>
          </div>

          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-600 rounded-lg">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-sm lg:text-base font-bold text-stone-900">Zalo Notification Service (ZNS)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Zalo Access Token</label>
                <input 
                  type="password" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Zalo Access Token"
                  value={eventData.zaloAccessToken || ''}
                  onChange={(e) => setEventData({...eventData, zaloAccessToken: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">ZNS Template ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Template ID"
                  value={eventData.zaloTemplateId || ''}
                  onChange={(e) => setEventData({...eventData, zaloTemplateId: e.target.value})}
                />
              </div>
            </div>
            <p className="text-[10px] lg:text-xs text-stone-500 italic">Cấu hình ZNS để gửi vé mời và thông báo qua Zalo cho khách mời.</p>
            
            <div className="mt-3 bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-blue-900 border-b border-blue-200 pb-1 inline-block mb-1">Hướng dẫn lấy Zalo Access Token & ZNS Template ID:</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Truy cập <a href="https://developers.zalo.me/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">Zalo for Developers</a> và tạo Ứng dụng mới.</li>
                <li>Vào mục <strong>Tài liệu ZNS</strong> để liên kết Zalo Official Account (OA) của bạn.</li>
                <li>Tạo và xin xét duyệt <strong>Mẫu tin nhắn (Template)</strong> trên hệ thống Zalo Cloud.</li>
                <li>Lấy <strong>Access Token</strong> của OA và <strong>Template ID</strong> (VD: 301234) dán vào đây để gửi vé tự động.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <h4 className="text-sm lg:text-base font-bold text-stone-900">Cấu hình Email riêng (SMTP)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="SMTP Host (vd: smtp.gmail.com)" value={eventData.smtpHost || ''} onChange={(e) => setEventData({...eventData, smtpHost: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="text" placeholder="SMTP Port (vd: 587)" value={eventData.smtpPort || ''} onChange={(e) => setEventData({...eventData, smtpPort: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="text" placeholder="SMTP User (Email)" value={eventData.smtpUser || ''} onChange={(e) => setEventData({...eventData, smtpUser: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="password" placeholder="SMTP Password (App Password)" value={eventData.smtpPass || ''} onChange={(e) => setEventData({...eventData, smtpPass: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="email" placeholder="Email người gửi (From Email)" value={eventData.smtpFrom || ''} onChange={(e) => setEventData({...eventData, smtpFrom: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl md:col-span-2" />
            </div>
            <p className="text-[10px] lg:text-xs text-stone-500 italic">Sử dụng SMTP riêng để tăng tỷ lệ thư được vào Inbox, tránh mục Spam.</p>
            
            <div className="mt-3 bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-stone-900 border-b border-stone-300 pb-1 inline-block mb-1">Hướng dẫn cấu hình gửi mail siêu tốc bằng Gmail (Miễn phí):</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li><strong>SMTP Host:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">smtp.gmail.com</code> và <strong>SMTP Port:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">587</code>.</li>
                <li><strong>SMTP User:</strong> Địa chỉ Gmail của bạn làm mail vãng lai gửi đi.</li>
                <li><strong>SMTP Password:</strong> BẮT BUỘC dùng <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Mật khẩu Ứng dụng (App password)</a> 16 chữ số do Google cấp, <em>không được dùng mật khẩu chính</em>. <br/><span className="ml-5 text-[10px] text-stone-500">(Lưu ý: Bạn phải bật Xác minh 2 bước của tài khoản Google thì mới tạo được).</span></li>
              </ol>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3 lg:gap-4 justify-end">
          <button
            onClick={handleSendReport}
            disabled={sendingReport}
            className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 disabled:opacity-70 text-sm lg:text-base"
          >
            {sendingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            Gửi báo cáo ngay
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-70 text-sm lg:text-base"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Lưu cài đặt
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4">
        <Bell className="w-6 h-6 text-amber-600 shrink-0" />
        <div>
          <h4 className="font-bold text-amber-900">Thông báo tự động</h4>
          <p className="text-sm text-amber-800 mt-1">
            Hệ thống sẽ tự động gửi email nhắc nhở cho khách mời 24 giờ trước khi sự kiện bắt đầu nếu tính năng này được bật trong phần Automation.
          </p>
        </div>
      </div>
    </div>
  );
}
