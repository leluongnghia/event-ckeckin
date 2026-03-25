import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, User, Mail, Building, Send, CheckCircle2, Loader2, X, Download, Calendar, Phone, MapPin, Info, Clock } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';

export default function PublicRegistration() {
  const { eventId = 'default-event' } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [eventSettings, setEventSettings] = useState<any>(null);
  const [registeredAttendee, setRegisteredAttendee] = useState<any>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventSettings(docSnap.data());
      }
    };
    fetchSettings();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const path = `events/${eventId}/attendees`;
      
      // 1. Kiểm tra email đã đăng ký chưa
      const q = query(collection(db, path), where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setStatus('error');
        setMessage('Email này đã được đăng ký cho sự kiện này.');
        return;
      }

      // 2. Thêm khách mời mới
      const attendeeData = {
        ...formData,
        status: 'registered',
        qrCode: Math.random().toString(36).substring(7),
        createdAt: serverTimestamp(),
        source: 'public_registration'
      };
      
      const docRef = await addDoc(collection(db, path), attendeeData);
      setRegisteredAttendee({ id: docRef.id, ...attendeeData });

      // 3. Generate QR for immediate view (client-side)
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(attendeeData.qrCode);
        setQrImage(url);
      } catch (qrErr) {
        console.error("QR generation error:", qrErr);
      }

      setStatus('success');
    } catch (error) {
      console.error("Registration error:", error);
      setStatus('error');
      setMessage('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  if (status === 'success' && registeredAttendee) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-stone-100"
        >
          <div id="printable-ticket" className="bg-stone-100 relative mx-auto overflow-hidden shadow-sm border border-stone-200" style={{ width: '100%', maxWidth: '400px', aspectRatio: '9/16' }}>
            {eventSettings?.ticketBgImage && (
              <img src={eventSettings.ticketBgImage} alt="Background" className="w-full h-full object-cover select-none pointer-events-none" />
            )}
            
            <div 
              className="absolute flex items-center justify-center"
              style={{
                left: `${eventSettings?.namePositionX ?? 50}%`,
                top: `${eventSettings?.namePositionY ?? 30}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                style={{
                  fontFamily: eventSettings?.ticketNameFont || "'Inter', sans-serif",
                  color: eventSettings?.ticketNameColor || '#1c1917',
                  fontSize: `${eventSettings?.nameFontSize || 24}px`,
                  whiteSpace: 'nowrap',
                  lineHeight: 1
                }}
                className="font-bold drop-shadow-md"
              >
                {registeredAttendee.name}
              </span>
            </div>

            <div 
              className="absolute bg-white p-2 rounded-lg shadow-lg flex items-center justify-center"
              style={{
                left: `${eventSettings?.qrPositionX ?? 50}%`,
                top: `${eventSettings?.qrPositionY ?? 60}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {qrImage ? (
                <img 
                  src={qrImage} 
                  alt="QR Code" 
                  className="block" 
                  style={{ width: `${eventSettings?.qrSize || 150}px`, height: `${eventSettings?.qrSize || 150}px` }} 
                />
              ) : (
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              )}
            </div>
          </div>

          <div className="p-10 pt-0 flex flex-col gap-3 no-print">
            <button 
              onClick={() => window.print()}
              className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Tải vé / In vé
            </button>
            <button 
              onClick={() => {
                setStatus('idle');
                setFormData({ name: '', email: '', phone: '', company: '' });
                setQrImage(null);
                setRegisteredAttendee(null);
              }}
              className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
            >
              Đăng ký cho người khác
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Hero Banner */}
      {eventSettings?.bannerImage && (
        <div className="relative w-full h-56 md:h-72 overflow-hidden">
          <img src={eventSettings.bannerImage} alt={eventSettings.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        </div>
      )}

      <div className={`max-w-2xl mx-auto px-4 ${eventSettings?.bannerImage ? '-mt-20 relative z-10' : 'pt-12'}`}>
        
        {/* Event Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden mb-6"
        >
          {/* Header */}
          <div 
            className="p-8 text-white text-center"
            style={{ backgroundColor: eventSettings?.ticketColor || '#059669' }}
          >
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{eventSettings?.name || 'Đăng Ký Tham Gia'}</h1>
          </div>

          {/* Event Details */}
          <div className="p-6 space-y-3 border-b border-stone-100">
            {(eventSettings?.startDate || eventSettings?.endDate) && (
              <div className="flex items-center gap-3 text-stone-600">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-medium">
                  {eventSettings.startDate}
                  {eventSettings.endDate && eventSettings.endDate !== eventSettings.startDate && ` — ${eventSettings.endDate}`}
                </span>
              </div>
            )}
            {eventSettings?.location && (
              <div className="flex items-center gap-3 text-stone-600">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-medium">{eventSettings.location}</span>
              </div>
            )}
            {eventSettings?.description && (
              <div className="flex items-start gap-3 text-stone-600 pt-1">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm leading-relaxed">{eventSettings.description}</p>
              </div>
            )}
          </div>

          {/* Agenda */}
          {Array.isArray(eventSettings?.agenda) && eventSettings.agenda.length > 0 && (
            <div className="px-6 pb-4 border-b border-stone-100">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Chương trình sự kiện
              </p>
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-stone-100" />
                <div className="space-y-4">
                  {eventSettings.agenda.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-400 shrink-0 flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <div className="pb-1">
                        {item.time && (
                          <p className="text-xs text-emerald-600 font-bold mb-0.5">{item.time}</p>
                        )}
                        <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                        {item.desc && (
                          <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-5">Thông tin đăng ký</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <User className="w-4 h-4" /> Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email nhận vé <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0901 234 567"
                  pattern="[0-9+\s\-]{9,15}"
                  className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Building className="w-4 h-4" /> Công ty / Tổ chức <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tên công ty của bạn"
                  className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-base hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Đăng ký ngay <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        <p className="text-center text-stone-400 text-xs pb-8">
          Bằng cách đăng ký, bạn đồng ý với các điều khoản của sự kiện.
        </p>
      </div>

      {/* Organizer footer */}
      {(eventSettings?.organizerName || eventSettings?.organizerLogo) && (
        <div className="border-t border-stone-200 bg-white py-6 px-4 mt-2">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            {eventSettings.organizerLogo && (
              <img
                src={eventSettings.organizerLogo}
                alt={eventSettings.organizerName || 'Organizer'}
                className="w-14 h-14 object-contain rounded-xl border border-stone-100 bg-stone-50 p-1 shrink-0"
              />
            )}
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-0.5">Ban tổ chức</p>
              {eventSettings.organizerName && (
                <p className="text-sm font-bold text-stone-800">{eventSettings.organizerName}</p>
              )}
              {eventSettings.organizerDesc && (
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{eventSettings.organizerDesc}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
