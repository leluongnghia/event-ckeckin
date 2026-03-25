import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Plus, Calendar, Users, ArrowRight, Trash2, Loader2, LayoutGrid, Image as ImageIcon, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function EventList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', startDate: '', endDate: '', location: '', description: '', bannerImage: '' });
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'events'),
      where('ownerId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    return () => unsubscribe();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userSettings = userSnap.exists() ? userSnap.data() : {};

      const docRef = await addDoc(collection(db, 'events'), {
        ...newEvent,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        ticketTitle: 'VÉ MỜI SỰ KIỆN',
        ticketSubtitle: newEvent.name,
        ticketColor: '#059669',
        telegramBotToken: userSettings.telegramBotToken || '',
        telegramChatId: userSettings.telegramChatId || '',
        zaloAccessToken: userSettings.zaloAccessToken || '',
        zaloTemplateId: userSettings.zaloTemplateId || '',
        smtpHost: userSettings.smtpHost || '',
        smtpPort: userSettings.smtpPort || '587',
        smtpUser: userSettings.smtpUser || '',
        smtpPass: userSettings.smtpPass || '',
        smtpFrom: userSettings.smtpFrom || '',
        customEmailMessage: userSettings.customEmailMessage || '',
        // Default Ticket Design derived from User's preferred template
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
      setIsAdding(false);
      setNewEvent({ name: '', startDate: '', endDate: '', location: '', description: '', bannerImage: '' });
      setBannerPreview('');
      navigate(`/dashboard/events/${docRef.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBannerPreview(result);
      setNewEvent(prev => ({ ...prev, bannerImage: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Toàn bộ dữ liệu khách mời sẽ bị mất.')) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-stone-900 tracking-tight">Sự kiện của bạn</h1>
            <p className="text-stone-500 font-medium mt-1">Quản lý và tạo mới các sự kiện check-in</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" />
            Tạo sự kiện mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {events.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group"
              >
                <Link to={`/dashboard/events/${event.id}`} className="block p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <button 
                      onClick={(e) => handleDeleteEvent(event.id, e)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-stone-900 truncate">{event.name}</h3>
                      <div className="text-stone-500 font-medium space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {event.startDate ? (
                            <span>{event.startDate} {event.endDate && ` - ${event.endDate}`}</span>
                          ) : 'Chưa đặt ngày'}
                        </p>
                      </div>
                    </div>

                  <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-bold">Quản lý khách mời</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>

          {events.length === 0 && !isAdding && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
                <LayoutGrid className="w-10 h-10" />
              </div>
              <p className="text-stone-400 font-medium">Bạn chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-3xl font-black text-stone-900 mb-2">Sự kiện mới</h2>
              <p className="text-stone-500 mb-8">Nhập thông tin cơ bản cho sự kiện của bạn</p>
              
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Tên sự kiện</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="Ví dụ: Hội thảo Tech 2024"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Ngày kết thúc</label>
                    <input 
                      type="date" 
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Địa điểm</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="Ví dụ: Trung tâm Hội nghị Quốc gia"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Giới thiệu sự kiện</label>
                  <textarea
                    rows={3}
                    className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none text-sm"
                    placeholder="Mô tả ngắn về sự kiện của bạn..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </div>

                {/* Banner Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Ảnh banner sự kiện</label>
                  {bannerPreview ? (
                    <div className="relative">
                      <img src={bannerPreview} alt="Banner" className="w-full h-36 object-cover rounded-2xl" />
                      <button
                        type="button"
                        onClick={() => { setBannerPreview(''); setNewEvent(prev => ({ ...prev, bannerImage: '' })); }}
                        className="absolute top-2 right-2 p-1.5 bg-stone-900/60 text-white rounded-full hover:bg-stone-900 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all">
                      <ImageIcon className="w-7 h-7 text-stone-400 mb-1" />
                      <span className="text-xs text-stone-400 font-medium">Nhấn để tải ảnh lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                    </label>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    Tạo ngay
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
