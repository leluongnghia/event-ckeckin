import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Palette, Save, Loader2, QrCode, Type, Image as ImageIcon, Upload, X, Move, Maximize2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import PageGuide from '../components/PageGuide';

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

const TICKETS_TEMPLATES = [
  {
    id: 'sample-1',
    name: 'Mẫu 1 (Blue Pro)',
    thumbnail: '/default-ticket-bg.jpg',
    config: {
      ticketBgImage: '/default-ticket-bg.jpg',
      ticketNameFont: "'Inter', sans-serif",
      ticketNameColor: '#FFFFFF',
      namePositionX: 50,
      namePositionY: 45,
      nameFontSize: 20,
      qrPositionX: 50,
      qrPositionY: 78,
      qrSize: 79
    }
  },
  {
    id: 'sample-2',
    name: 'Mẫu 2 (FPT Schools)',
    thumbnail: '/sample-fpt.png',
    config: {
      ticketBgImage: '/sample-fpt.png',
      ticketNameFont: "'Dancing Script', cursive",
      ticketNameColor: '#b91c1c',
      namePositionX: 52,
      namePositionY: 13,
      nameFontSize: 28,
      qrPositionX: 33,
      qrPositionY: 67,
      qrSize: 160
    }
  },
  {
    id: 'sample-3',
    name: 'Mẫu 3 (P&G SDDS)',
    thumbnail: '/sample-pg.png',
    config: {
      ticketBgImage: '/sample-pg.png',
      ticketNameFont: "'Montserrat', sans-serif",
      ticketNameColor: '#FFFFFF',
      namePositionX: 50,
      namePositionY: 59,
      nameFontSize: 32,
      qrPositionX: 50,
      qrPositionY: 43,
      qrSize: 140
    }
  },
  {
    id: 'sample-4',
    name: 'Mẫu 4 (Vitus System)',
    thumbnail: '/sample-vitus.png',
    config: {
      ticketBgImage: '/sample-vitus.png',
      ticketNameFont: "'Inter', sans-serif",
      ticketNameColor: '#1c1917',
      namePositionX: 50,
      namePositionY: 44,
      nameFontSize: 24,
      qrPositionX: 50,
      qrPositionY: 65,
      qrSize: 220
    }
  },
  {
    id: 'sample-5',
    name: 'Mẫu 5 (Phú Đông)',
    thumbnail: '/sample-phudong.png',
    config: {
      ticketBgImage: '/sample-phudong.png',
      ticketNameFont: "'Montserrat', sans-serif",
      ticketNameColor: '#FFFFFF',
      namePositionX: 50,
      namePositionY: 13,
      nameFontSize: 22,
      qrPositionX: 50,
      qrPositionY: 80,
      qrSize: 140
    }
  },
  {
    id: 'sample-6',
    name: 'Mẫu 6 (Trần Phú)',
    thumbnail: '/sample-tranphu.png',
    config: {
      ticketBgImage: '/sample-tranphu.png',
      ticketNameFont: "'Inter', sans-serif",
      ticketNameColor: '#1c1917',
      namePositionX: 50,
      namePositionY: 67,
      nameFontSize: 18,
      qrPositionX: 48,
      qrPositionY: 49,
      qrSize: 150
    }
  },
  {
    id: 'sample-7',
    name: 'Mẫu 7 (ĐH Y Hà Nội)',
    thumbnail: '/sample-dhy.png',
    config: {
      ticketBgImage: '/sample-dhy.png',
      ticketNameFont: "'Inter', sans-serif",
      ticketNameColor: '#1c1917',
      namePositionX: 50,
      namePositionY: 41,
      nameFontSize: 22,
      qrPositionX: 50,
      qrPositionY: 57,
      qrSize: 160
    }
  }
];

export default function TicketDesign() {
  const { eventId = 'default-event' } = useParams();
  const [eventData, setEventData] = useState({
    ticketBgImage: '/default-ticket-bg.jpg',
    ticketNameFont: "'Inter', sans-serif",
    ticketNameColor: '#FFFFFF',
    namePositionX: 50,
    namePositionY: 45,
    nameFontSize: 20,
    qrPositionX: 50,
    qrPositionY: 78,
    qrSize: 79
  });
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<string>('9/16');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect aspect ratio when image changes
  useEffect(() => {
    if (eventData.ticketBgImage) {
      const img = new Image();
      img.onload = () => {
        setImageAspectRatio(`${img.width}/${img.height}`);
      };
      img.src = eventData.ticketBgImage;
    } else {
      setImageAspectRatio('9/16'); // Default portrait
    }
  }, [eventData.ticketBgImage]);

  useEffect(() => {
    import('qrcode').then(QRCode => {
      QRCode.default.toDataURL('EC-2026-XYZ', { margin: 1 }).then(setQrBase64);
    });

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEventDetails(data);
          setEventData({
            ticketBgImage: data.ticketBgImage || '/default-ticket-bg.jpg',
            ticketNameFont: data.ticketNameFont || "'Inter', sans-serif",
            ticketNameColor: data.ticketNameColor || '#FFFFFF',
            namePositionX: data.namePositionX ?? 50,
            namePositionY: data.namePositionY ?? 45,
            nameFontSize: data.nameFontSize || 20,
            qrPositionX: data.qrPositionX ?? 50,
            qrPositionY: data.qrPositionY ?? 78,
            qrSize: data.qrSize || 79,
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
        ...eventData
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
      if (file.size > 5 * 1024 * 1024) { // 5MB max check before compress
        alert("Hình ảnh quá lớn. Vui lòng chọn hình ảnh dưới 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG 80% quality to avoid Firestore 1MB limit and fix UX lag
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setEventData({ ...eventData, ticketBgImage: compressedBase64 });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e: React.MouseEvent, type: 'name' | 'qr') => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startBaseX = type === 'name' ? eventData.namePositionX : eventData.qrPositionX;
    const startBaseY = type === 'name' ? eventData.namePositionY : eventData.qrPositionY;

    const handleMouseMove = (mouseEvent: MouseEvent) => {
      const dx = mouseEvent.clientX - startX;
      const dy = mouseEvent.clientY - startY;
      const dxPercent = (dx / rect.width) * 100;
      const dyPercent = (dy / rect.height) * 100;
      
      if (type === 'name') {
        setEventData(prev => ({
          ...prev,
          namePositionX: Math.max(0, Math.min(100, startBaseX + dxPercent)),
          namePositionY: Math.max(0, Math.min(100, startBaseY + dyPercent)),
        }));
      } else {
        setEventData(prev => ({
          ...prev,
          qrPositionX: Math.max(0, Math.min(100, startBaseX + dxPercent)),
          qrPositionY: Math.max(0, Math.min(100, startBaseY + dyPercent)),
        }));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, type: 'name' | 'qr') => {
    e.preventDefault();
    e.stopPropagation(); // DO NOT trigger the move handler
    
    const startX = e.clientX;
    const startSize = type === 'name' ? eventData.nameFontSize : eventData.qrSize;
    
    const handleMouseMove = (mouseEvent: MouseEvent) => {
      // Moving right/down increases size, moving left/up decreases
      const dx = mouseEvent.clientX - startX;
      
      const newSize = Math.max(type === 'name' ? 10 : 50, startSize + dx);
      if (type === 'name') {
        setEventData(prev => ({ ...prev, nameFontSize: newSize }));
      } else {
        setEventData(prev => ({ ...prev, qrSize: newSize }));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
        description="Đơn giản hoá việc thiết kế: Chỉ cần tải hình nền lên, sau đó kéo-thả vị trí của Tên khách mời và Mã QR sao cho phù hợp với thiết kế của bạn."
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h4 className="font-bold text-stone-900 text-lg border-b border-stone-100 pb-4">Chọn mẫu vé mời</h4>
            <div className="grid grid-cols-2 gap-4">
              {TICKETS_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setEventData({ ...eventData, ...template.config })}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-95 group ${eventData.ticketBgImage === template.config.ticketBgImage ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-stone-100'}`}
                >
                  <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">{template.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h4 className="font-bold text-stone-900 text-lg border-b border-stone-100 pb-4">Cài đặt Hình & Chữ</h4>
            
            <div className="space-y-4">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Hình nền vé (Background Image)
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
                  <p>Khuyến nghị Tỷ lệ: Dọc (ví dụ: 1080x1920)</p>
                  <p>Định dạng: JPG, PNG, WebP (Tối đa 2MB)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Type className="w-4 h-4" /> Font chữ tên khách mời
              </label>
              <select
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={eventData.ticketNameFont}
                onChange={(e) => setEventData({ ...eventData, ticketNameFont: e.target.value })}
              >
                {FONTS.map(font => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Màu chữ
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-10 h-10 rounded-xl border border-stone-200 cursor-pointer p-1 bg-white shrink-0"
                    value={eventData.ticketNameColor}
                    onChange={(e) => setEventData({ ...eventData, ticketNameColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs uppercase"
                    value={eventData.ticketNameColor}
                    onChange={(e) => setEventData({ ...eventData, ticketNameColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Cỡ chữ (px)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={eventData.nameFontSize}
                  onChange={(e) => setEventData({ ...eventData, nameFontSize: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Kích thước QR (px)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                value={eventData.qrSize}
                onChange={(e) => setEventData({ ...eventData, qrSize: Number(e.target.value) })}
              />
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3 mt-4">
              <Move className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">
                <strong>Mẹo:</strong> Rê chuột vào <em>Tên khách mời</em> hoặc <em>Mã QR</em> ở bên phải, nhấn giữ và kéo để thả đúng vào vị trí bạn muốn trên hình nền.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="lg:col-span-7 space-y-4">
          <label className="text-sm font-semibold text-stone-700 uppercase tracking-widest ml-2">Bản xem trước & Kéo thả trực tiếp</label>
          <div className="sticky top-24 flex justify-center">
            
            <div 
              ref={containerRef}
              className="bg-stone-100 rounded-lg shadow-2xl border border-stone-200 overflow-hidden relative"
              style={{
                width: '100%',
                maxWidth: '400px',
                aspectRatio: imageAspectRatio
              }}
            >
              {/* Background Image */}
              {eventData.ticketBgImage ? (
                <img src={eventData.ticketBgImage} alt="Background" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                  <ImageIcon className="w-20 h-20 opacity-20" />
                </div>
              )}

              {/* Draggable Invitee Name */}
              <div 
                className="absolute cursor-move hover:outline hover:outline-2 hover:outline-dashed hover:outline-emerald-500 flex items-center justify-center group"
                style={{
                  left: `${eventData.namePositionX}%`,
                  top: `${eventData.namePositionY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleDragStart(e, 'name')}
              >
                <div className="absolute -inset-4 z-0" /> {/* Larger hit area */}
                <span
                  style={{
                    fontFamily: eventData.ticketNameFont,
                    color: eventData.ticketNameColor,
                    fontSize: `${eventData.nameFontSize}px`,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    lineHeight: 1
                  }}
                  className="font-bold drop-shadow-md z-10"
                >
                  Nguyễn Văn A
                </span>
                
                {/* Resize Handle */}
                <div 
                  className="absolute -right-3 -bottom-3 w-6 h-6 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full shadow-lg cursor-nwse-resize opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 hover:bg-emerald-100 hover:scale-110 transition-transform"
                  onMouseDown={(e) => handleResizeStart(e, 'name')}
                  title="Kéo để chỉnh Cỡ chữ"
                >
                  <Maximize2 className="w-3 h-3 rotate-90" />
                </div>
              </div>

              {/* Draggable QR Code */}
              <div 
                className="absolute bg-white p-2 rounded-lg shadow-lg cursor-move hover:outline hover:outline-2 hover:outline-dashed hover:outline-emerald-500 flex items-center justify-center group"
                style={{
                  left: `${eventData.qrPositionX}%`,
                  top: `${eventData.qrPositionY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={(e) => handleDragStart(e, 'qr')}
              >
                <div className="absolute -inset-4 z-0" /> {/* Larger hit area */}
                {qrBase64 ? (
                  <img 
                    src={qrBase64} 
                    alt="QR Code" 
                    draggable={false} 
                    className="select-none z-10 block" 
                    style={{ width: `${eventData.qrSize}px`, height: `${eventData.qrSize}px` }} 
                  />
                ) : (
                  <div 
                    className="bg-stone-200 flex items-center justify-center z-10" 
                    style={{ width: `${eventData.qrSize}px`, height: `${eventData.qrSize}px` }}
                  >
                    <QrCode className="w-1/2 h-1/2 text-stone-400" />
                  </div>
                )}
                
                {/* Resize Handle */}
                <div 
                  className="absolute -right-3 -bottom-3 w-6 h-6 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full shadow-lg cursor-nwse-resize opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 hover:bg-emerald-100 hover:scale-110 transition-transform"
                  onMouseDown={(e) => handleResizeStart(e, 'qr')}
                  title="Kéo để chỉnh Kích thước QR"
                >
                  <Maximize2 className="w-3 h-3 rotate-90" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
