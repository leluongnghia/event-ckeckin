import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Search, User, CheckCircle2, Loader2, X, ArrowLeft, Star, Calendar } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function SessionCheckIn() {
  const { eventId = 'default-event', sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'checking_in' | 'success' | 'error'>('idle');
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      const docRef = doc(db, `events/${eventId}/sessions`, sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSession(docSnap.data());
      }
      setLoading(false);
    };
    fetchSession();
  }, [eventId, sessionId]);

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
        setMessage('Không tìm thấy khách mời nào.');
      }
    } catch (error) {
      console.error("Search error:", error);
      setMessage('Lỗi tìm kiếm.');
    } finally {
      setStatus('idle');
    }
  };

  const handleSessionCheckIn = async (attendee: any) => {
    setStatus('checking_in');
    const path = `events/${eventId}/sessions/${sessionId}/attendance/${attendee.id}`;
    try {
      await setDoc(doc(db, `events/${eventId}/sessions/${sessionId}/attendance`, attendee.id), {
        attendeeId: attendee.id,
        attendeeName: attendee.name,
        checkinTime: serverTimestamp()
      });
      setSelectedAttendee(attendee);
      setStatus('success');
      setMessage(`Đã ghi nhận tham gia phiên: ${session.title}`);
      
      setTimeout(() => {
        resetMode();
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      setStatus('error');
      setMessage('Lỗi ghi nhận tham gia.');
    }
  };

  const resetMode = () => {
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
    <div className="min-h-screen bg-stone-900 text-white font-sans">
      <header className="p-8 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/events/${eventId}/sessions`)} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-emerald-500">{session?.title || 'Phiên thảo luận'}</h1>
            <p className="text-stone-400">Điểm danh tham gia phiên</p>
          </div>
        </div>
        <Calendar className="w-10 h-10 text-stone-500" />
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
                <h2 className="text-5xl font-black tracking-tight uppercase">GHI NHẬN THÀNH CÔNG</h2>
                <p className="text-3xl text-emerald-400 font-bold">{selectedAttendee?.name}</p>
                <p className="text-xl text-stone-400">{message}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 text-stone-500" />
                <input 
                  type="text"
                  placeholder="Tìm tên khách mời tham gia phiên..."
                  className="w-full pl-24 pr-8 py-10 bg-white/5 border-2 border-white/10 rounded-[3rem] text-4xl font-bold focus:border-emerald-500 focus:bg-white/10 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-auto pr-4 custom-scrollbar">
                {searchResults.map((attendee) => (
                  <button
                    key={attendee.id}
                    onClick={() => handleSessionCheckIn(attendee)}
                    className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                        <User className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold flex items-center gap-3">
                          {attendee.name}
                          {attendee.isVIP && <Star className="w-6 h-6 fill-amber-400 text-amber-400" />}
                        </p>
                        <p className="text-stone-400">{attendee.company || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-emerald-600/20 text-emerald-500 rounded-2xl font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      GHI DANH
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
    </div>
  );
}
