import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, CheckCircle2, XCircle, Loader2, Search, User, Building, Clock } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import PublicNavbar from '../components/PublicNavbar';

export default function PublicCheckIn() {
  const { eventId = 'default-event' } = useParams();
  const [eventSettings, setEventSettings] = useState<any>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; attendee?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const isProcessing = React.useRef(false);
  const [manualCode, setManualCode] = useState('');

  const scannerRef = React.useRef<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setEventSettings(docSnap.data());
    };
    fetchSettings();

    let isCleaningUp = false;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const qr = new Html5Qrcode("reader");
        scannerRef.current = qr;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!isCleaningUp && !isProcessing.current) {
              handleCheckIn(decodedText, qr);
            }
          },
          undefined
        );
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    const timeoutId = setTimeout(startScanner, 100);

    return () => {
      isCleaningUp = true;
      clearTimeout(timeoutId);
      const qr = scannerRef.current;
      if (qr && qr.isScanning) {
        qr.stop().then(() => qr.clear()).catch(console.error);
      }
    };
  }, [eventId]);

  const handleCheckIn = async (code: string, scanner?: any) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setLoading(true);
    setScanResult(null);

    // Pause scanner while processing
    const qr = scanner || scannerRef.current;
    try {
      if (qr?.isScanning) await qr.pause(true);
    } catch (_) {}

    try {
      const path = `events/${eventId}/attendees`;
      const q = query(collection(db, path), where("qrCode", "==", code.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setScanResult({ success: false, message: 'Mã vé không hợp lệ hoặc không tồn tại trong sự kiện này.' });
      } else {
        const attendeeDoc = querySnapshot.docs[0];
        const attendeeData = attendeeDoc.data();

        if (attendeeData.status === 'checked_in') {
          setScanResult({
            success: false,
            message: 'Khách mời này đã check-in trước đó.',
            attendee: attendeeData
          });
        } else {
          await updateDoc(doc(db, path, attendeeDoc.id), {
            status: 'checked_in',
            checkinTime: serverTimestamp()
          });
          setScanResult({
            success: true,
            message: 'Check-in thành công!',
            attendee: { ...attendeeData, status: 'checked_in' }
          });
        }
      }
    } catch (error) {
      console.error("Check-in error:", error);
      setScanResult({ success: false, message: 'Đã có lỗi xảy ra khi xử lý check-in.' });
    } finally {
      setLoading(false);
      setManualCode('');
      // Resume scanner after 4 seconds so staff can see result
      setTimeout(async () => {
        try {
          const qr = scannerRef.current;
          if (qr?.isScanning === false) await qr.resume();
        } catch (_) {}
        isProcessing.current = false;
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white font-sans flex flex-col pt-[72px]">
      <PublicNavbar />
      {/* Header */}
      <header className="p-6 bg-stone-800/50 backdrop-blur-md border-b border-stone-700 sticky top-[72px] z-20">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{eventSettings?.name || 'Sự kiện'}</h1>
            <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">Cổng Check-in PG</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center max-w-md mx-auto w-full space-y-8">
        {/* Scanner Area */}
        <div className="w-full space-y-4">
          <div className="bg-stone-800 rounded-[2.5rem] overflow-hidden border border-stone-700 shadow-2xl relative">
            <div id="reader" className="w-full"></div>
            {loading && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              </div>
            )}
          </div>
          <p className="text-center text-stone-500 text-sm font-medium">Đưa mã QR vào khung hình để quét</p>
        </div>

        {/* Manual Input */}
        <div className="w-full space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
            <input 
              type="text" 
              placeholder="Nhập mã vé thủ công..."
              className="w-full pl-12 pr-4 py-4 bg-stone-800 border border-stone-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-lg font-mono"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn(manualCode)}
            />
          </div>
          <button 
            onClick={() => handleCheckIn(manualCode)}
            disabled={!manualCode || loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            Check-in thủ công
          </button>
        </div>

        {/* Result Overlay - Full screen so it's always visible */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{ backgroundColor: scanResult.success ? 'rgba(6,78,59,0.97)' : 'rgba(69,10,10,0.97)' }}
            >
              <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
                {/* Icon */}
                <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl ${
                  scanResult.success ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {scanResult.success
                    ? <CheckCircle2 className="w-16 h-16 text-white" />
                    : <XCircle className="w-16 h-16 text-white" />
                  }
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <h2 className={`text-4xl font-black uppercase tracking-tight ${
                    scanResult.success ? 'text-emerald-300' : 'text-red-300'
                  }`}>
                    {scanResult.success ? '✓ Thành công!' : '✗ Thất bại'}
                  </h2>
                  <p className="text-xl text-white/80">{scanResult.message}</p>
                </div>

                {/* Attendee info */}
                {scanResult.attendee && (
                  <div className="w-full bg-white/10 rounded-3xl p-6 space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-white/60 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Khách mời</p>
                        <p className="text-xl font-black text-white">{scanResult.attendee.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-white/60 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Công ty</p>
                        <p className="text-lg font-bold text-white">{scanResult.attendee.company || 'N/A'}</p>
                      </div>
                    </div>
                    {scanResult.success && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-white/60 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Thời gian check-in</p>
                          <p className="text-lg font-bold text-white">{new Date().toLocaleTimeString('vi-VN')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dismiss */}
                <button
                  onClick={() => { setScanResult(null); isProcessing.current = false; }}
                  className="w-full py-4 bg-white/20 hover:bg-white/30 active:scale-95 rounded-2xl text-white font-bold text-lg transition-all"
                >
                  Tiếp tục quét
                </button>
                <p className="text-white/40 text-xs">Tự động đóng sau 4 giây</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center">
        <p className="text-stone-600 text-[10px] font-bold uppercase tracking-[0.3em]">EventCheck PG Portal v2.0</p>
      </footer>
    </div>
  );
}
