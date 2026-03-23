import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, User, Mail, Building, Send, CheckCircle2, Loader2, X, Download, Calendar } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import axios from 'axios';

export default function PublicRegistration() {
  const { eventId = 'default-event' } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

      // 3. Generate QR for immediate view
      try {
        const qrResponse = await axios.post('/api/qr/generate', { data: attendeeData.qrCode });
        setQrImage(qrResponse.data.qrImage);
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
          <div 
            id="printable-ticket" 
            className="bg-white relative"
            style={{ backgroundColor: eventSettings?.ticketBodyBgColor || '#ffffff', color: eventSettings?.ticketBodyTextColor || '#1c1917' }}
          >
            {/* Background Image Layer */}
            {eventSettings?.ticketBgImage && (
              <div className="absolute inset-0 z-0">
                <img src={eventSettings.ticketBgImage} alt="Background" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/40" />
              </div>
            )}

            <div className="relative z-10">
              <div 
                className="p-12 text-white text-center space-y-2"
                style={{ backgroundColor: eventSettings?.ticketColor || '#059669' }}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight uppercase">{eventSettings?.ticketTitle || 'VÉ MỜI SỰ KIỆN'}</h3>
                <p className="text-emerald-100 font-medium">{eventSettings?.ticketSubtitle || 'EventCheck SaaS Experience'}</p>
              </div>

              <div className="p-10 space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    Đăng ký thành công
                  </div>
                  <p className="text-sm" style={{ opacity: 0.5 }}>Vui lòng lưu lại vé mời này để check-in tại sự kiện</p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-left">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Khách mời</p>
                    <p 
                      className="text-xl font-bold"
                      style={{ 
                        fontFamily: eventSettings?.ticketNameFont || 'inherit',
                        color: eventSettings?.ticketNameColor || '#1c1917'
                      }}
                    >
                      {registeredAttendee.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Công ty</p>
                    <p className="text-base font-bold">{registeredAttendee.company || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Email</p>
                    <p className="text-sm" style={{ opacity: 0.7 }}>{registeredAttendee.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Mã vé</p>
                    <p className="font-mono text-sm" style={{ opacity: 0.7 }}>{registeredAttendee.qrCode}</p>
                  </div>
                </div>

                <div 
                  className="flex flex-col items-center justify-center p-6 backdrop-blur-sm rounded-3xl border-2 border-dashed"
                  style={{ borderColor: `${eventSettings?.ticketBodyTextColor || '#1c1917'}20`, backgroundColor: `${eventSettings?.ticketBodyTextColor || '#1c1917'}05` }}
                >
                  {qrImage ? (
                    <div className="space-y-3 text-center">
                      <img src={qrImage} alt="QR Code" className="w-40 h-40 mx-auto" />
                      <p className="text-[10px] uppercase font-bold tracking-tighter" style={{ opacity: 0.4 }}>Mã check-in của bạn</p>
                    </div>
                  ) : (
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  )}
                </div>
              </div>
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
                setFormData({ name: '', email: '', company: '' });
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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-xl w-full grid grid-cols-1 gap-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 mb-2">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">{eventSettings?.name || 'Đăng Ký Tham Gia'}</h1>
          <div className="text-stone-500 text-lg">
            {eventSettings?.startDate ? (
              <div className="flex flex-col items-center">
                <p className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>{eventSettings.startDate} {eventSettings.endDate && ` - ${eventSettings.endDate}`}</span>
                </p>
                {eventSettings?.location && (
                  <p className="text-stone-400 text-sm font-medium mt-1">{eventSettings.location}</p>
                )}
              </div>
            ) : (
              <p>Vui lòng điền thông tin để nhận vé mời điện tử</p>
            )}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Họ và tên
              </label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email nhận vé
              </label>
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <Building className="w-4 h-4" /> Công ty / Tổ chức
              </label>
              <input
                type="text"
                placeholder="Tên công ty của bạn"
                className="w-full px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 rotate-180" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {status === 'loading' ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Đăng ký ngay <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-stone-400 text-sm">
          Bằng cách đăng ký, bạn đồng ý với các điều khoản của sự kiện.
        </p>
      </div>
    </div>
  );
}
