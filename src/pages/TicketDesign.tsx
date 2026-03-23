import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Palette, Save, Loader2, QrCode, Type, Layout as LayoutIcon, Image as ImageIcon, Upload, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import PageGuide from '../components/PageGuide';
import { TEMPLATES, renderTemplate } from '../utils/templates';

const FONTS = [
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Lora', value: "'Lora', serif" },
  { name: 'Oswald', value: "'Oswald', sans-serif" },
  { name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { name: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Raleway', value: "'Raleway', sans-serif" },
  { name: 'Merriweather', value: "'Merriweather', serif" },
];

export default function TicketDesign() {
  const { eventId = 'default-event' } = useParams();
  const [eventData, setEventData] = useState({
    ticketTemplateId: 'default',
    ticketTitle: 'VÉ MỜI SỰ KIỆN',
    ticketSubtitle: 'EventCheck SaaS Experience',
    ticketColor: '#059669', // emerald-600
    ticketBgImage: '',
    ticketBodyBgColor: '#ffffff',
    ticketBodyTextColor: '#1c1917',
    ticketNameFont: "'Inter', sans-serif",
    ticketNameColor: '#1c1917', // stone-900
  });
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import('qrcode').then(QRCode => {
      QRCode.default.toDataURL('SAMPLE-QR-CODE-123', { margin: 1 }).then(setQrBase64);
    });

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEventDetails(data);
          setEventData({
            ticketTemplateId: data.ticketTemplateId || 'default',
            ticketTitle: data.ticketTitle || 'VÉ MỜI SỰ KIỆN',
            ticketSubtitle: data.ticketSubtitle || 'EventCheck SaaS Experience',
            ticketColor: data.ticketColor || '#059669',
            ticketBgImage: data.ticketBgImage || '',
            ticketBodyBgColor: data.ticketBodyBgColor || '#ffffff',
            ticketBodyTextColor: data.ticketBodyTextColor || '#1c1917',
            ticketNameFont: data.ticketNameFont || "'Inter', sans-serif",
            ticketNameColor: data.ticketNameColor || '#1c1917',
          });
        }
      } catch (error) {
        console.error("Error fetching event settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};
      
      await setDoc(docRef, {
        ...currentData,
        ticketTemplateId: eventData.ticketTemplateId,
        ticketTitle: eventData.ticketTitle,
        ticketSubtitle: eventData.ticketSubtitle,
        ticketColor: eventData.ticketColor,
        ticketBgImage: eventData.ticketBgImage,
        ticketBodyBgColor: eventData.ticketBodyBgColor,
        ticketBodyTextColor: eventData.ticketBodyTextColor,
        ticketNameFont: eventData.ticketNameFont,
        ticketNameColor: eventData.ticketNameColor,
      });
      alert("Đã lưu thiết kế vé thành công!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `events/${eventId}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64
        alert("Hình ảnh quá lớn. Vui lòng chọn hình ảnh dưới 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventData({ ...eventData, ticketBgImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageGuide 
        title="Thiết kế vé mời"
        description="Tuỳ chỉnh giao diện vé mời QR Code của bạn tại đây. Thay đổi thông điệp, màu sắc, font chữ và hình nền sao cho phù hợp với bộ nhận diện của sự kiện."
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-emerald-600" />
          <h3 className="text-3xl font-bold text-stone-900">Thiết kế vé mời</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Lưu thiết kế
        </button>
      </div>

      {/* Template Selection */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <label className="text-sm font-semibold text-stone-700 uppercase tracking-widest">Thư viện Mẫu (SaaS Templates)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {TEMPLATES.map(t => (
            <div 
              key={t.id} 
              onClick={() => setEventData({ ...eventData, ticketTemplateId: t.id })}
              className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center gap-3 text-center ${eventData.ticketTemplateId === t.id ? 'border-emerald-500 bg-emerald-50 shadow-md transform scale-105' : 'border-stone-100 bg-stone-50 hover:border-emerald-200'}`}
            >
              <div className="w-12 h-16 bg-white rounded shadow-sm border border-stone-200 overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col pt-2 items-center opacity-30">
                  <span className="w-8 h-2 bg-stone-300 rounded-full mb-1"></span>
                  <span className="w-10 h-1 bg-stone-200 rounded-full mb-2"></span>
                  <div className="w-8 h-8 border-2 border-dashed border-stone-300 rounded" />
                </div>
              </div>
              <p className="text-xs font-bold text-stone-700">{t.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Editor Side */}
        {eventData.ticketTemplateId === 'default' && (
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Type className="w-4 h-4" /> Tiêu đề vé
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={eventData.ticketTitle || ''}
                onChange={(e) => setEventData({ ...eventData, ticketTitle: e.target.value })}
                placeholder="Ví dụ: VÉ MỜI SỰ KIỆN"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <LayoutIcon className="w-4 h-4" /> Phụ đề vé
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={eventData.ticketSubtitle || ''}
                onChange={(e) => setEventData({ ...eventData, ticketSubtitle: e.target.value })}
                placeholder="Ví dụ: Hội thảo Công nghệ 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Màu chủ đạo
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-xl border border-stone-200 cursor-pointer p-1 bg-white"
                    value={eventData.ticketColor || '#000000'}
                    onChange={(e) => setEventData({ ...eventData, ticketColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm uppercase"
                    value={eventData.ticketColor || ''}
                    onChange={(e) => setEventData({ ...eventData, ticketColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Màu chữ tên khách
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-xl border border-stone-200 cursor-pointer p-1 bg-white"
                    value={eventData.ticketNameColor || '#000000'}
                    onChange={(e) => setEventData({ ...eventData, ticketNameColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm uppercase"
                    value={eventData.ticketNameColor || ''}
                    onChange={(e) => setEventData({ ...eventData, ticketNameColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Màu nền thân vé
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-xl border border-stone-200 cursor-pointer p-1 bg-white"
                    value={eventData.ticketBodyBgColor || '#000000'}
                    onChange={(e) => setEventData({ ...eventData, ticketBodyBgColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm uppercase"
                    value={eventData.ticketBodyBgColor || ''}
                    onChange={(e) => setEventData({ ...eventData, ticketBodyBgColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Màu chữ thân vé
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-xl border border-stone-200 cursor-pointer p-1 bg-white"
                    value={eventData.ticketBodyTextColor || '#000000'}
                    onChange={(e) => setEventData({ ...eventData, ticketBodyTextColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-sm uppercase"
                    value={eventData.ticketBodyTextColor || ''}
                    onChange={(e) => setEventData({ ...eventData, ticketBodyTextColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Type className="w-4 h-4" /> Font chữ tên khách mời
              </label>
              <select
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={eventData.ticketNameFont || "'Inter', sans-serif"}
                onChange={(e) => setEventData({ ...eventData, ticketNameFont: e.target.value })}
              >
                {FONTS.map(font => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Hình nền vé (Background)
              </label>
              <div className="flex gap-4 items-start">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-all group overflow-hidden relative"
                >
                  {eventData.ticketBgImage ? (
                    <>
                      <img src={eventData.ticketBgImage} alt="Background" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-stone-400 group-hover:text-emerald-500" />
                      <span className="text-[10px] text-stone-400 mt-1">Tải lên</span>
                    </>
                  )}
                </div>
                {eventData.ticketBgImage && (
                  <button 
                    onClick={() => setEventData({ ...eventData, ticketBgImage: '' })}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="flex-1 text-xs text-stone-500 space-y-1">
                  <p>Dung lượng tối đa: 1MB</p>
                  <p>Định dạng: JPG, PNG, WebP</p>
                  <p>Hình nền sẽ được phủ mờ hoặc làm nền cho phần nội dung vé.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5" /> Mẹo thiết kế
            </h4>
            <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside opacity-80">
              <li>Sử dụng hình nền có độ tương phản thấp để chữ dễ đọc.</li>
              <li>Font chữ 'Dancing Script' phù hợp cho các sự kiện trang trọng, đám cưới.</li>
              <li>Màu chữ tên khách nên tương phản tốt với hình nền.</li>
            </ul>
          </div>
        </div>
        )}

        {eventData.ticketTemplateId !== 'default' && (
          <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <LayoutIcon className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-emerald-900 mb-2">Mẫu HTML Cao Cấp</h4>
              <p className="text-emerald-700 text-sm max-w-sm mx-auto">
                Bạn đang sử dụng template tự động hóa. Thông tin bao gồm <b>Logo của bạn, Tên sự kiện, Tên khách mời, Thời gian, Địa điểm</b> sẽ tự động được thu thập từ cài đặt sự kiện và inject trực tiếp vào giao diện vé.
              </p>
            </div>
            <p className="text-xs text-emerald-600 border border-emerald-200 py-1.5 px-4 rounded-full bg-white">
              Sắp tới: Tính năng Drag & Drop Builder
            </p>
          </div>
        )}

        {/* Preview Side */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-stone-700 uppercase tracking-widest ml-2">Bản xem trước trực tiếp</label>
          <div className="sticky top-24">
            
            {eventData.ticketTemplateId === 'default' ? (
            <div 
              className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-stone-100 transform transition-all hover:scale-[1.02] relative"
              style={{ backgroundColor: eventData.ticketBodyBgColor, color: eventData.ticketBodyTextColor }}
            >
              {/* Background Image Layer */}
              {eventData.ticketBgImage && (
                <div className="absolute inset-0 z-0">
                  <img src={eventData.ticketBgImage} alt="Background" className="w-full h-full object-cover opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/40" />
                </div>
              )}

              <div className="relative z-10">
                <div 
                  className="p-16 text-white text-center space-y-3 transition-colors duration-500"
                  style={{ backgroundColor: eventData.ticketColor }}
                >
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase">{eventData.ticketTitle}</h3>
                  <p className="text-lg font-medium opacity-90">{eventData.ticketSubtitle}</p>
                </div>

                <div className="p-12 space-y-10">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ opacity: 0.5 }}>Khách mời</p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ 
                          fontFamily: eventData.ticketNameFont,
                          color: eventData.ticketNameColor
                        }}
                      >
                        Nguyễn Văn A
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ opacity: 0.5 }}>Công ty</p>
                      <p className="text-xl font-bold">EventCheck Co.</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ opacity: 0.5 }}>Mã vé</p>
                      <p className="text-lg font-mono" style={{ opacity: 0.8 }}>EC-2026-XYZ</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ opacity: 0.5 }}>Ngày giờ</p>
                      <p className="text-xl font-bold">20/05/2026</p>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col items-center justify-center p-12 backdrop-blur-sm rounded-[2.5rem] border-4 border-dashed relative overflow-hidden group"
                    style={{ borderColor: `${eventData.ticketBodyTextColor}20`, backgroundColor: `${eventData.ticketBodyTextColor}05` }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${eventData.ticketColor}10` }} />
                    <QrCode className="w-40 h-40 relative z-10" style={{ color: `${eventData.ticketBodyTextColor}30` }} />
                    <p className="text-xs mt-6 font-medium uppercase tracking-widest" style={{ opacity: 0.4 }}>Mã QR mẫu</p>
                  </div>
                </div>
                
                <div className="bg-stone-900 p-6 text-center">
                  <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.3em]">Powered by EventCheck SaaS</p>
                </div>
              </div>
            </div>
            ) : (
              <div 
                className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex items-center justify-center relative min-h-[550px]"
                dangerouslySetInnerHTML={{
                  __html: renderTemplate(
                    TEMPLATES.find(t => t.id === eventData.ticketTemplateId)?.html || '',
                    {
                      company: eventDetails?.organizerName || Object.keys(eventDetails || {}).length ? eventDetails?.organizerName || 'Ban Tổ Chức' : 'EventCheck Co.',
                      name: 'Nguyễn Văn A',
                      event_name: eventDetails?.name || 'Sự kiện Giao lưu 2026',
                      time: `${eventDetails?.startDate || '20/05/2026'} - ${eventDetails?.startTime || '08:00'}`,
                      location: eventDetails?.location || 'Trung tâm Hội nghị Quốc gia',
                      qr: qrBase64
                    }
                  )
                }}
              />
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
