import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, XCircle, Loader2, Printer, UserPlus, Star, X } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, addDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { sendTelegramNotification } from '../utils/notifications';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  qrCode: string;
  isVIP?: boolean;
}

export default function CheckIn() {
  const { eventId = 'default-event' } = useParams();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInData, setWalkInData] = useState({ name: '', email: '', phone: '', company: '' });
  const [isVIP, setIsVIP] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineQueue();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline queue
    const savedQueue = localStorage.getItem(`offline_queue_${eventId}`);
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    let html5QrCode: Html5Qrcode | null = null;
    let isCleaningUp = false;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!isCleaningUp) {
              setScanResult(decodedText);
              handleCheckIn(decodedText);
            }
          },
          undefined
        );
        if (isCleaningUp && html5QrCode.isScanning) {
          await html5QrCode.stop();
          html5QrCode.clear();
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    const timeoutId = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      isCleaningUp = true;
      clearTimeout(timeoutId);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode?.clear();
        }).catch(console.error);
      }
    };
  }, []);

  const syncOfflineQueue = async () => {
    const savedQueue = localStorage.getItem(`offline_queue_${eventId}`);
    if (!savedQueue) return;

    const queue: string[] = JSON.parse(savedQueue);
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline check-ins...`);
    for (const code of queue) {
      await handleCheckIn(code, true);
    }
    
    localStorage.removeItem(`offline_queue_${eventId}`);
    setOfflineQueue([]);
  };

  const handleCheckIn = async (code: string, isSyncing = false) => {
    if (isProcessing.current && !isSyncing) return;
    if (!isSyncing) isProcessing.current = true;
    if (!isSyncing) setStatus('loading');
    
    if (!navigator.onLine && !isSyncing) {
      const newQueue = [...offlineQueue, code];
      setOfflineQueue(newQueue);
      localStorage.setItem(`offline_queue_${eventId}`, JSON.stringify(newQueue));
      setStatus('success');
      setMessage('Đang ngoại tuyến. Check-in đã được lưu tạm thời và sẽ đồng bộ khi có mạng.');
      return;
    }

    const path = `events/${eventId}/attendees`;
    try {
      const q = query(collection(db, path), where("qrCode", "==", code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setStatus('error');
        setMessage('Mã QR không tồn tại trong hệ thống.');
        return;
      }

      const attendeeDoc = querySnapshot.docs[0];
      const attendeeData = { id: attendeeDoc.id, ...attendeeDoc.data() } as Attendee;
      setCurrentAttendee(attendeeData);
      setIsVIP(!!attendeeData.isVIP);

      if (attendeeData.status === 'checked_in') {
        setStatus('error');
        setMessage(`Khách mời ${attendeeData.name} đã check-in trước đó.`);
        return;
      }

      await updateDoc(doc(db, path, attendeeDoc.id), {
        status: 'checked_in',
        checkinTime: serverTimestamp()
      });

      setStatus('success');
      setMessage(`Check-in thành công! Chào mừng ${attendeeData.name}.`);
      
      if (attendeeData.isVIP) {
        // Trigger browser notification if supported
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("VIP Check-in!", { body: `${attendeeData.name} vừa mới check-in.` });
        }

        // Send Telegram notification
        try {
          const eventDoc = await getDoc(doc(db, 'events', eventId));
          if (eventDoc.exists()) {
            const eventSettings = eventDoc.data();
            if (eventSettings.telegramBotToken && eventSettings.telegramChatId) {
              const telegramMessage = `<b>🌟 THÔNG BÁO VIP CHECK-IN</b>\n\n` +
                `👤 <b>Khách mời:</b> ${attendeeData.name}\n` +
                `🏢 <b>Công ty:</b> ${attendeeData.company || 'N/A'}\n` +
                `📅 <b>Sự kiện:</b> ${eventSettings.name}\n` +
                `⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;
              
              await sendTelegramNotification(
                eventSettings.telegramBotToken,
                eventSettings.telegramChatId,
                telegramMessage
              );
            }
          }
        } catch (error) {
          console.error("Failed to send VIP notification:", error);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      setStatus('error');
      setMessage('Đã có lỗi xảy ra trong quá trình check-in.');
    } finally {
      if (!isSyncing) isProcessing.current = false;
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const path = `events/${eventId}/attendees`;
      const qrCode = Math.random().toString(36).substring(7).toUpperCase();
      const attendeeData = {
        name: walkInData.name,
        email: walkInData.email,
        phone: walkInData.phone,
        company: walkInData.company,
        status: 'checked_in',
        qrCode,
        checkinTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        source: 'walk_in'
      };
      const docRef = await addDoc(collection(db, path), attendeeData);
      setCurrentAttendee({ id: docRef.id, ...attendeeData } as Attendee);
      setIsVIP(false);
      setStatus('success');
      setMessage(`Đăng ký vãng lai thành công! Chào mừng ${walkInData.name}.`);
      setIsWalkInOpen(false);
      setWalkInData({ name: '', email: '', phone: '', company: '' });
    } catch (error) {
      console.error("Walk-in error:", error);
      setStatus('error');
      setMessage('Đã có lỗi xảy ra khi đăng ký vãng lai.');
    }
  };

  const resetScanner = () => {
    window.location.reload();
  };

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="text-left">
          <h3 className="text-xl lg:text-2xl font-bold text-stone-900">Quét mã QR Check-in</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-sm text-stone-500">Vui lòng đưa mã QR vào khung hình</p>
            {isOffline && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Ngoại tuyến</span>
            )}
            {offlineQueue.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Đang chờ: {offlineQueue.length}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsWalkInOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all border border-emerald-200 w-full lg:w-auto text-sm lg:text-base"
        >
          <UserPlus className="w-5 h-5" />
          Khách vãng lai
        </button>
      </div>

      <div className="bg-white p-4 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden relative">
        {isVIP && status === 'success' && (
          <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white py-2 lg:py-3 px-4 lg:px-6 flex items-center justify-center gap-2 font-black text-sm lg:text-lg animate-bounce z-20">
            <Star className="w-4 h-4 lg:w-6 lg:h-6 fill-current" />
            VIP CHECK-IN THÀNH CÔNG!
            <Star className="w-4 h-4 lg:w-6 lg:h-6 fill-current" />
          </div>
        )}

        <div className={status === 'idle' || status === 'scanning' ? 'block' : 'hidden'}>
          <div id="reader" className="w-full overflow-hidden rounded-2xl"></div>
        </div>
        
        {status !== 'idle' && status !== 'scanning' && (
          <div className="flex flex-col items-center justify-center py-8 lg:py-12 space-y-6 lg:space-y-8 animate-in fade-in zoom-in duration-300">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 lg:w-20 lg:h-20 text-emerald-500 animate-spin" />
            )}
            {status === 'success' && (
              <>
                <div className="relative">
                  <CheckCircle2 className="w-20 h-20 lg:w-24 lg:h-24 text-emerald-500" />
                  {isVIP && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-lg">
                      <Star className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />
                    </div>
                  )}
                </div>
                <div className="text-center space-y-2 px-4">
                  <h4 className="text-xl lg:text-2xl font-black text-stone-900 uppercase">Thành công</h4>
                  <p className="text-stone-600 text-base lg:text-lg font-medium leading-tight">{message}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full px-4">
                  <button
                    onClick={handlePrintBadge}
                    className="flex-1 py-3.5 lg:py-4 bg-stone-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 text-sm lg:text-base"
                  >
                    <Printer className="w-5 h-5" /> In thẻ tên
                  </button>
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3.5 lg:py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 text-sm lg:text-base"
                  >
                    Tiếp tục quét
                  </button>
                </div>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="w-20 h-20 lg:w-24 lg:h-24 text-red-500" />
                <div className="text-center space-y-2 px-4">
                  <h4 className="text-xl lg:text-2xl font-black text-stone-900 uppercase">Thất bại</h4>
                  <p className="text-stone-600 text-base lg:text-lg font-medium leading-tight">{message}</p>
                </div>
                <div className="w-full px-4">
                  <button
                    onClick={resetScanner}
                    className="w-full py-3.5 lg:py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all text-sm lg:text-base"
                  >
                    Thử lại
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Printable Badge (Hidden in UI) */}
      {currentAttendee && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 text-center">
          <div className="border-4 border-black p-12 rounded-[3rem] max-w-md mx-auto space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-black uppercase tracking-[0.3em]">EventCheck Badge</p>
              <div className="h-1 bg-black w-24 mx-auto"></div>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tight leading-none">{currentAttendee.name}</h1>
            <p className="text-2xl font-bold text-stone-600">{currentAttendee.company || 'N/A'}</p>
            <div className="pt-8 flex justify-center">
              <div className="w-32 h-32 border-2 border-black flex items-center justify-center">
                <p className="text-[10px] font-bold uppercase">QR Code</p>
              </div>
            </div>
            {isVIP && (
              <div className="bg-black text-white py-4 px-8 rounded-full inline-block font-black text-xl tracking-widest">
                VIP GUEST
              </div>
            )}
          </div>
        </div>
      )}

      {/* Walk-in Modal */}
      <AnimatePresence>
        {isWalkInOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setIsWalkInOpen(false)}
                className="absolute right-6 top-6 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-stone-900 mb-6">Đăng ký khách vãng lai</h3>

              <form onSubmit={handleWalkInSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-stone-700">Họ và tên</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={walkInData.name}
                    onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-stone-700">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={walkInData.email}
                    onChange={(e) => setWalkInData({ ...walkInData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-stone-700">Số điện thoại</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={walkInData.phone}
                    onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-stone-700">Công ty</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={walkInData.company}
                    onChange={(e) => setWalkInData({ ...walkInData, company: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Đăng ký & Check-in
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
