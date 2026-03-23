import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings as SettingsIcon, Save, Calendar, MapPin, Type, Bell, Loader2, QrCode, CheckCircle2, Mail, FileText, Send, Map as MapIcon, ExternalLink, Image as ImageIcon, X, Building, ListOrdered, Plus, GripVertical, Clock } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    ticketColor: '#059669',
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
    smtpFrom: '',
    bannerImage: '',
    organizerName: '',
    organizerDesc: '',
    organizerLogo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [mapResults, setMapResults] = useState<any[]>([]);
  const [searchingMap, setSearchingMap] = useState(false);
  const [agenda, setAgenda] = useState<{ time: string; title: string; desc: string }[]>([]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEventData(prev => ({ ...prev, ...data }));
          if (Array.isArray(data.agenda)) setAgenda(data.agenda);
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
      await setDoc(doc(db, 'events', eventId), { ...eventData, agenda });
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
        body: JSON.stringify({ eventId, targetEmail: eventData.reportEmail || auth.currentUser?.email })
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
    if (!eventData.location) { alert("Vui lòng nhập địa điểm sự kiện."); return; }
    setSearchingMap(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Tìm các địa điểm thú vị gần ${eventData.location}`,
        config: { tools: [{ googleMaps: {} }] },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      setMapResults(chunks ? chunks.filter((c: any) => c.maps).map((c: any) => c.maps) : []);
    } catch (error) {
      console.error("Maps error:", error);
      alert("Lỗi khi tìm kiếm bản đồ.");
    } finally {
      setSearchingMap(false);
    }
  };

  const handleParsePaste = () => {
    const lines = pasteText.split('\n').filter(l => l.trim());
    const parsed = lines.map(line => {
      const timeMatch = line.trim().match(/^(\d{1,2}[:.h]\d{2})\s+/);
      let rest = line.trim();
      let time = '';
      if (timeMatch) {
        time = timeMatch[1].replace('.', ':').replace('h', ':');
        rest = line.trim().slice(timeMatch[0].length);
      }
      const parts = rest.split(/ - (.+)/);
      return { time, title: parts[0]?.trim() || '', desc: parts[1]?.trim() || '' };
    }).filter(i => i.title);
    setAgenda(prev => [...prev, ...parsed]);
    setPasteText('');
    setPasteMode(false);
  };

  const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm lg:text-base";

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <div className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-stone-200 shadow-sm space-y-6 lg:space-y-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 lg:pb-6">
          <SettingsIcon className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
          <h3 className="text-xl lg:text-2xl font-bold text-stone-900">Cài đặt sự kiện</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2"><Type className="w-4 h-4" /> Tên sự kiện</label>
            <input type="text" className={inputCls} value={eventData.name || ''} onChange={e => setEventData({ ...eventData, name: e.target.value })} />
          </div>

          {/* Start date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày bắt đầu</label>
            <input type="date" className={inputCls} value={eventData.startDate || ''} onChange={e => setEventData({ ...eventData, startDate: e.target.value })} />
          </div>

          {/* End date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày kết thúc</label>
            <input type="date" className={inputCls} value={eventData.endDate || ''} onChange={e => setEventData({ ...eventData, endDate: e.target.value })} />
          </div>

          {/* Location */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2"><MapPin className="w-4 h-4" /> Địa điểm</label>
            <div className="flex gap-2">
              <input type="text" className={`flex-1 ${inputCls}`} value={eventData.location || ''} onChange={e => setEventData({ ...eventData, location: e.target.value })} />
              <button onClick={handleFindNearby} disabled={searchingMap} className="px-4 py-3 bg-stone-100 text-stone-700 rounded-2xl hover:bg-stone-200 transition-all flex items-center gap-2">
                {searchingMap ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapIcon className="w-5 h-5" />}
              </button>
            </div>
            {mapResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-stone-700">Địa điểm gần đó:</p>
                {mapResults.map((m, i) => (
                  <a key={i} href={m.uri} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-stone-50 rounded-xl text-sm text-emerald-700 hover:bg-emerald-50">
                    {m.title} <ExternalLink className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700">Mô tả sự kiện</label>
            <textarea rows={4} className={inputCls} value={eventData.description || ''} onChange={e => setEventData({ ...eventData, description: e.target.value })} />
          </div>

          {/* Banner Image */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Ảnh banner sự kiện</label>
            {eventData.bannerImage ? (
              <div className="relative">
                <img src={eventData.bannerImage} alt="Banner" className="w-full h-40 object-cover rounded-2xl" />
                <button type="button" onClick={() => setEventData({ ...eventData, bannerImage: '' })} className="absolute top-2 right-2 p-1.5 bg-stone-900/60 text-white rounded-full hover:bg-stone-900 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all">
                <ImageIcon className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-xs text-stone-400 font-medium">Nhấn để tải ảnh lên (hiển thị trên trang đăng ký công khai)</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setEventData({ ...eventData, bannerImage: reader.result as string });
                  reader.readAsDataURL(file);
                }} />
              </label>
            )}
          </div>

          {/* Organizer */}
          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-stone-700">Ban tổ chức</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-500">Logo ban tổ chức</label>
                {(eventData as any).organizerLogo ? (
                  <div className="relative w-32 h-32">
                    <img src={(eventData as any).organizerLogo} alt="Logo" className="w-32 h-32 object-contain rounded-2xl border border-stone-200 bg-stone-50 p-2" />
                    <button type="button" onClick={() => setEventData({ ...eventData, organizerLogo: '' } as any)} className="absolute -top-2 -right-2 p-1 bg-stone-900/70 text-white rounded-full hover:bg-stone-900 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-32 h-32 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all">
                    <ImageIcon className="w-7 h-7 text-stone-400 mb-1" />
                    <span className="text-[10px] text-stone-400 font-medium text-center px-1">Tải logo lên</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setEventData({ ...eventData, organizerLogo: reader.result as string } as any);
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                )}
              </div>
              <div className="space-y-3 flex-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Tên ban tổ chức</label>
                  <input type="text" placeholder="Ví dụ: Công ty XYZ" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" value={(eventData as any).organizerName || ''} onChange={e => setEventData({ ...eventData, organizerName: e.target.value } as any)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500">Giới thiệu ngắn</label>
                  <textarea rows={3} placeholder="Mô tả ngắn về ban tổ chức..." className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm resize-none" value={(eventData as any).organizerDesc || ''} onChange={e => setEventData({ ...eventData, organizerDesc: e.target.value } as any)} />
                </div>
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-stone-700">Agenda chương trình</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPasteMode(!pasteMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${pasteMode ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  {pasteMode ? 'Chế độ thủ công' : '📋 Dán nhanh'}
                </button>
                {!pasteMode && (
                  <button type="button" onClick={() => setAgenda([...agenda, { time: '', title: '', desc: '' }])} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all">
                    <Plus className="w-3.5 h-3.5" /> Thêm mục
                  </button>
                )}
              </div>
            </div>

            {pasteMode ? (
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
                  <p className="font-bold">Hướng dẫn dán nhanh — mỗi dòng = 1 mục:</p>
                  <div className="bg-amber-100 rounded-xl px-3 py-2 font-mono leading-6 text-amber-900">
                    <div>08:00 Đăng ký và đón khách</div>
                    <div>09:00 Khai mạc sự kiện - Phát biểu khai mạc</div>
                    <div>10:30 Hội thảo chuyên đề - Diễn giả: Nguyễn Văn A</div>
                  </div>
                  <p className="text-amber-600">Giờ (HH:MM) ở đầu dòng tuỳ chọn. Dấu " - " phân cách tiêu đề và mô tả.</p>
                </div>
                <textarea
                  rows={8}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-mono resize-y"
                  placeholder={`08:00 Đăng ký và đón khách\n09:00 Khai mạc sự kiện - Phát biểu khai mạc\n10:30 Hội thảo chuyên đề`}
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleParsePaste} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">
                    Phân tích và thêm vào agenda
                  </button>
                  <button type="button" onClick={() => { setPasteText(''); setPasteMode(false); }} className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200 transition-all">
                    Huỷ
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {agenda.length === 0 ? (
                  <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center">
                    <ListOrdered className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs text-stone-400">Chưa có mục agenda nào. Nhấn "Thêm mục" hoặc "Dán nhanh".</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agenda.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-stone-50 border border-stone-200 rounded-2xl p-4">
                        <GripVertical className="w-4 h-4 text-stone-300 mt-3 shrink-0" />
                        <div className="flex flex-col md:flex-row gap-3 flex-1">
                          <div className="flex items-center gap-2 shrink-0">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <input type="time" className="w-28 px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" value={item.time} onChange={e => { const u = [...agenda]; u[idx] = { ...u[idx], time: e.target.value }; setAgenda(u); }} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <input type="text" placeholder="Tiêu đề (ví dụ: Khai mạc sự kiện)" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none" value={item.title} onChange={e => { const u = [...agenda]; u[idx] = { ...u[idx], title: e.target.value }; setAgenda(u); }} />
                            <input type="text" placeholder="Mô tả ngắn (tuỳ chọn)" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none" value={item.desc} onChange={e => { const u = [...agenda]; u[idx] = { ...u[idx], desc: e.target.value }; setAgenda(u); }} />
                          </div>
                        </div>
                        <button type="button" onClick={() => setAgenda(agenda.filter((_, i) => i !== idx))} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 mt-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Survey Link */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">Link khảo sát sau sự kiện</label>
            <input type="url" placeholder="https://forms.gle/..." className={inputCls} value={eventData.surveyLink || ''} onChange={e => setEventData({ ...eventData, surveyLink: e.target.value })} />
            <p className="text-[10px] lg:text-xs text-stone-400 italic">Link này sẽ được gửi tự động cho khách mời sau khi sự kiện kết thúc.</p>
          </div>

          {/* Report Email */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2"><Mail className="w-4 h-4" /> Email nhận báo cáo tổng kết</label>
            <input type="email" placeholder="Email sẽ nhận báo cáo sau khi sự kiện kết thúc" className={inputCls} value={eventData.reportEmail || ''} onChange={e => setEventData({ ...eventData, reportEmail: e.target.value })} />
          </div>

          {/* Telegram */}
          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-500" />
              <h4 className="text-sm lg:text-base font-bold text-stone-900">Thông báo Telegram (VIP Check-in)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Bot Token</label>
                <input type="password" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-sm lg:text-base" placeholder="Nhập Telegram Bot Token" value={eventData.telegramBotToken || ''} onChange={e => setEventData({ ...eventData, telegramBotToken: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Chat ID</label>
                <input type="text" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-sm lg:text-base" placeholder="Nhập Telegram Chat ID" value={eventData.telegramChatId || ''} onChange={e => setEventData({ ...eventData, telegramChatId: e.target.value })} />
              </div>
            </div>
            <p className="text-[10px] lg:text-xs text-stone-400 italic">Hệ thống sẽ tự động gửi thông báo đến Telegram khi có khách mời VIP thực hiện check-in.</p>
          </div>

          {/* ZNS */}
          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-600 rounded-lg"><QrCode className="w-4 h-4 text-white" /></div>
              <h4 className="text-sm lg:text-base font-bold text-stone-900">Zalo Notification Service (ZNS)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Zalo Access Token</label>
                <input type="password" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm lg:text-base" placeholder="Nhập Zalo Access Token" value={eventData.zaloAccessToken || ''} onChange={e => setEventData({ ...eventData, zaloAccessToken: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">ZNS Template ID</label>
                <input type="text" className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm lg:text-base" placeholder="Nhập Template ID" value={eventData.zaloTemplateId || ''} onChange={e => setEventData({ ...eventData, zaloTemplateId: e.target.value })} />
              </div>
            </div>
            <p className="text-[10px] lg:text-xs text-stone-500 italic">Cấu hình ZNS để gửi vé mời và thông báo qua Zalo cho khách mời.</p>
            <div className="mt-3 bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-blue-900 border-b border-blue-200 pb-1 inline-block mb-1">Hướng dẫn lấy Zalo Access Token &amp; ZNS Template ID:</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Truy cập <a href="https://developers.zalo.me/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">Zalo for Developers</a> và tạo Ứng dụng mới.</li>
                <li>Vào mục <strong>Tài liệu ZNS</strong> để liên kết Zalo Official Account (OA) của bạn.</li>
                <li>Tạo và xin xét duyệt <strong>Mẫu tin nhắn (Template)</strong> trên hệ thống Zalo Cloud.</li>
                <li>Lấy <strong>Access Token</strong> của OA và <strong>Template ID</strong> dán vào đây để gửi vé tự động.</li>
              </ol>
            </div>
          </div>

          {/* SMTP */}
          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <h4 className="text-sm lg:text-base font-bold text-stone-900">Cấu hình Email riêng (SMTP)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="SMTP Host (vd: smtp.gmail.com)" value={eventData.smtpHost || ''} onChange={e => setEventData({ ...eventData, smtpHost: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="text" placeholder="SMTP Port (vd: 587)" value={eventData.smtpPort || ''} onChange={e => setEventData({ ...eventData, smtpPort: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="text" placeholder="SMTP User (Email)" value={eventData.smtpUser || ''} onChange={e => setEventData({ ...eventData, smtpUser: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="password" placeholder="SMTP Password (App Password)" value={eventData.smtpPass || ''} onChange={e => setEventData({ ...eventData, smtpPass: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="email" placeholder="Email người gửi (From Email)" value={eventData.smtpFrom || ''} onChange={e => setEventData({ ...eventData, smtpFrom: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl md:col-span-2" />
            </div>
            <p className="text-[10px] lg:text-xs text-stone-500 italic">Sử dụng SMTP riêng để tăng tỷ lệ thư được vào Inbox, tránh mục Spam.</p>
            <div className="mt-3 bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-stone-900 border-b border-stone-300 pb-1 inline-block mb-1">Hướng dẫn cấu hình gửi mail siêu tốc bằng Gmail (Miễn phí):</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li><strong>SMTP Host:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">smtp.gmail.com</code> và <strong>SMTP Port:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">587</code>.</li>
                <li><strong>SMTP User:</strong> Địa chỉ Gmail của bạn làm mail vãng lai gửi đi.</li>
                <li><strong>SMTP Password:</strong> BẮT BUỘC dùng <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Mật khẩu Ứng dụng (App password)</a> 16 chữ số do Google cấp.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3 lg:gap-4 justify-end">
          <button onClick={handleSendReport} disabled={sendingReport} className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 disabled:opacity-70 text-sm lg:text-base">
            {sendingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            Gửi báo cáo ngay
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-70 text-sm lg:text-base">
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
