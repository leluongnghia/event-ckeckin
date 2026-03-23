import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Plus, Trash2, Edit2, Users, Loader2, Save, X, CheckCircle2, QrCode } from 'lucide-react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const SessionCard: React.FC<{ session: any, eventId: string, onEdit: (s: any) => void, onDelete: (id: string) => Promise<void> }> = ({ session, eventId, onEdit, onDelete }) => {
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    const path = `events/${eventId}/sessions/${session.id}/attendance`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAttendanceCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [eventId, session.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
          <Clock className="w-6 h-6" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(session)}
            className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h4 className="text-xl font-bold text-stone-900 mb-2">{session.title}</h4>
      <div className="space-y-2 text-sm text-stone-500 mb-6">
        <p className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {session.startTime} - {session.endTime}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {session.location || 'N/A'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <div className="flex items-center gap-2 text-stone-600 font-medium">
          <Users className="w-4 h-4" />
          <span>Tham dự: {attendanceCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to={`/events/${eventId}/sessions/${session.id}/checkin`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            Điểm danh
          </Link>
          <button className="text-stone-400 font-bold text-sm hover:text-stone-600">
            Chi tiết
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Sessions() {
  const { eventId = 'default-event' } = useParams();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const path = `events/${eventId}/sessions`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const path = `events/${eventId}/sessions`;
      if (editingSession) {
        await updateDoc(doc(db, path, editingSession.id), formData);
      } else {
        await addDoc(collection(db, path), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setEditingSession(null);
      setFormData({ title: '', startTime: '', endTime: '', location: '', description: '' });
    } catch (error) {
      console.error("Session save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiên này?')) return;
    try {
      await deleteDoc(doc(db, `events/${eventId}/sessions`, id));
    } catch (error) {
      console.error("Session delete error:", error);
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-emerald-600" />
          <h3 className="text-3xl font-bold text-stone-900">Quản lý phiên (Sessions)</h3>
        </div>
        <button
          onClick={() => {
            setEditingSession(null);
            setFormData({ title: '', startTime: '', endTime: '', location: '', description: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Thêm phiên mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            eventId={eventId}
            onEdit={(s) => {
              setEditingSession(s);
              setFormData({
                title: s.title || '',
                startTime: s.startTime || '',
                endTime: s.endTime || '',
                location: s.location || '',
                description: s.description || ''
              });
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-stone-900 mb-6">
                {editingSession ? 'Sửa phiên' : 'Thêm phiên mới'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-stone-700">Tên phiên</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-stone-700">Bắt đầu</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.startTime || ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-stone-700">Kết thúc</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={formData.endTime || ''}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-stone-700">Địa điểm</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-stone-700">Mô tả</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  Lưu phiên
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
