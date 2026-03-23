import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Search, User, CheckCircle2, Loader2, X, ArrowLeft, Star } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function KioskMode() {
  const { eventId = 'default-event' } = useParams();
  const navigate = useNavigate();
  const [eventSettings, setEventSettings] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'checking_in' | 'success' | 'error'>('idle');
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventSettings(docSnap.data());
      }
      setLoading(false);
    };
    fetchSettings();
  }, [eventId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setStatus('searching');
    try {
      const path = `events/${eventId}/attendees`;
      const q = query(
        collection(db, path),
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSearchResults(results);
      if (results.length === 0) {
        setMessage('Không tìm thấy khách mời nào với tên này.');
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage('Đã có lỗi xảy ra khi tìm kiếm.');
    } finally {
      setStatus('idle');
    }
  };

  const handleCheckIn = async (attendee: any) => {
    if (attendee.status === 'checked_in') {
      setSelectedAttendee(attendee);
      setStatus('success');
      setMessage('Bạn đã check-in trước đó rồi!');
      return;
    }

    setStatus('checking_in');
    try {
      const docRef = doc(db, `events/${eventId}/attendees`, attendee.id);
      await updateDoc(docRef, {
        status: 'checked_in',
        checkinTime: serverTimestamp()
      });
      setSelectedAttendee(attendee);
      setStatus('success');
      setMessage('Chào mừng bạn đến với sự kiện!');
      
      // Auto reset after 5 seconds
      setTimeout(() => {
        resetKiosk();
      }, 5000);
    } catch (error) {
      console.error("Check-in error:", error);
      setStatus('error');
      setMessage('Đã có lỗi xảy ra khi check-in.');
    }
  };

  const resetKiosk = () => {
    setStatus('idle');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedAttendee(null);
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="p-8 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/events/${eventId}`)} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-emerald-500">{eventSettings?.name || 'Sự kiện'}</h1>
            <p className="text-stone-400">Chế độ Tự phục vụ (Kiosk Mode)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black tracking-tighter">EventCheck</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 pt-20">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8"
            >
              <div className="w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-24 h-24 text-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-6xl font-black tracking-tight flex items-center justify-center gap-4">
                  XIN CHÀO!
                  {selectedAttendee?.isVIP && (
                    <Star className="w-12 h-12 fill-amber-400 text-amber-400 animate-pulse" />
                  )}
                </h2>
                <p className="text-4xl text-emerald-400 font-bold uppercase">{selectedAttendee?.name}</p>
                <p className="text-2xl text-stone-400">{message}</p>
              </div>
              <button 
                onClick={resetKiosk}
                className="px-12 py-6 bg-white text-stone-900 rounded-3xl font-black text-2xl hover:bg-stone-100 transition-all"
              >
                TIẾP TỤC
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black tracking-tight">CHÀO MỪNG BẠN</h2>
                <p className="text-2xl text-stone-400">Vui lòng nhập tên của bạn để check-in</p>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 text-stone-500" />
                <input 
                  type="text"
                  placeholder="Nhập tên của bạn..."
                  className="w-full pl-24 pr-8 py-10 bg-white/5 border-2 border-white/10 rounded-[3rem] text-4xl font-bold focus:border-emerald-500 focus:bg-white/10 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-6 top-1/2 -translate-y-1/2 px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-bold text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                >
                  TÌM KIẾM
                </button>
              </form>

              {/* Search Results */}
              <div className="grid grid-cols-1 gap-4 max-h-[40vh] overflow-auto pr-4 custom-scrollbar">
                {searchResults.map((attendee) => (
                  <button
                    key={attendee.id}
                    onClick={() => handleCheckIn(attendee)}
                    className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                        <User className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold flex items-center gap-3">
                          {attendee.name}
                          {attendee.isVIP && (
                            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                          )}
                        </p>
                        <p className="text-stone-400">{attendee.company || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {attendee.status === 'checked_in' ? (
                        <div className="flex items-center gap-2 text-emerald-500 font-bold">
                          <CheckCircle2 className="w-6 h-6" />
                          <span>ĐÃ CHECK-IN</span>
                        </div>
                      ) : (
                        <div className="px-8 py-4 bg-emerald-600/20 text-emerald-500 rounded-2xl font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          CHECK-IN NGAY
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {status === 'searching' && (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                  </div>
                )}
                {message && !searchResults.length && status === 'idle' && (
                  <div className="text-center py-12 text-stone-500 text-2xl font-medium">
                    {message}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 text-center text-stone-600 text-sm uppercase tracking-widest">
        Chạm vào tên của bạn để hoàn tất check-in
      </footer>
    </div>
  );
}
