import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, Mail, Loader2, QrCode, X, Calendar, Sparkles, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

import { useParams } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-sm text-stone-500 font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-stone-900 mt-1">{value}</h3>
  </div>
);

export default function Dashboard() {
  const { eventId = 'default-event' } = useParams();
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
    emailsSent: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAttendee, setPreviewAttendee] = useState<any>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [eventSettings, setEventSettings] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attendeesData, setAttendeesData] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEventSettings(docSnap.data());
      }
    };
    fetchSettings();
    const path = `events/${eventId}/attendees`;
    const q = query(collection(db, path));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttendeesData(attendees);
      const total = attendees.length;
      const checkedIn = attendees.filter((a: any) => a.status === 'checked_in').length;
      
      setStats({
        total,
        checkedIn,
        pending: total - checkedIn,
        emailsSent: attendees.filter((a: any) => a.emailSent).length
      });

      // Recent activity (last 5 check-ins)
      const recent = attendees
        .filter((a: any) => a.status === 'checked_in' && a.checkinTime)
        .sort((a: any, b: any) => {
          const timeA = a.checkinTime.toDate ? a.checkinTime.toDate().getTime() : new Date(a.checkinTime).getTime();
          const timeB = b.checkinTime.toDate ? b.checkinTime.toDate().getTime() : new Date(b.checkinTime).getTime();
          return timeB - timeA;
        })
        .slice(0, 5);
      setRecentActivity(recent);

      // Simple time-based chart data
      const hours: Record<string, number> = {};
      attendees.forEach((a: any) => {
        if (a.checkinTime) {
          const date = a.checkinTime.toDate ? a.checkinTime.toDate() : new Date(a.checkinTime);
          const hour = date.getHours() + ':00';
          hours[hour] = (hours[hour] || 0) + 1;
        }
      });

      const chart = Object.entries(hours).map(([time, count]) => ({ time, count })).sort((a, b) => a.time.localeCompare(b.time));
      setChartData(chart.length > 0 ? chart : [{ time: 'N/A', count: 0 }]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  const openPreview = async (attendee: any) => {
    setPreviewAttendee(attendee);
    setIsPreviewOpen(true);
    setQrImage(null);
    try {
      const response = await axios.post('/api/qr/generate', { data: attendee.qrCode });
      setQrImage(response.data.qrImage);
    } catch (error) {
      console.error("Failed to generate QR", error);
    }
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Bạn là một chuyên gia phân tích sự kiện. Hãy phân tích dữ liệu sau đây của sự kiện "${eventSettings?.name || 'Sự kiện'}" và đưa ra các nhận xét, dự báo và lời khuyên hữu ích cho ban tổ chức.
      
      Dữ liệu hiện tại:
      - Tổng số khách mời: ${stats.total}
      - Đã check-in: ${stats.checkedIn} (${attendanceRate}%)
      - Chưa check-in: ${stats.pending}
      - Email đã gửi: ${stats.emailsSent}
      
      Hoạt động gần đây:
      ${recentActivity.map(a => `- ${a.name} (${a.company || 'N/A'}) check-in lúc ${a.checkinTime.toDate ? a.checkinTime.toDate().toLocaleTimeString() : new Date(a.checkinTime).toLocaleTimeString()}`).join('\n')}
      
      Hãy trình bày bằng tiếng Việt, định dạng Markdown, bao gồm các phần:
      1. Đánh giá tiến độ check-in hiện tại.
      2. Dự báo lưu lượng khách trong thời gian tới (nếu có thể).
      3. Các khuyến nghị cụ thể để cải thiện trải nghiệm khách mời hoặc quy trình check-in.
      4. Một câu slogan truyền cảm hứng cho ban tổ chức.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiAnalysis(response.text || "Không có phản hồi từ AI.");
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("Đã có lỗi xảy ra khi phân tích dữ liệu bằng AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const attendanceRate = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-4xl font-black text-stone-900 tracking-tight">{eventSettings?.name || 'Dashboard'}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-stone-500 font-medium text-sm lg:text-base">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{eventSettings?.startDate || 'N/A'} {eventSettings?.endDate && `- ${eventSettings.endDate}`}</span>
            </div>
            {eventSettings?.location && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{eventSettings.location}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleAIAnalysis}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 disabled:opacity-50 w-full lg:w-auto text-sm lg:text-base"
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
          Phân tích bằng AI
        </button>
      </div>

      {aiAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-stone-900 to-stone-800 p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 hidden lg:block">
            <BrainCircuit className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-400 rounded-xl">
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-stone-900" />
              </div>
              <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tight">AI Insights</h3>
              <button 
                onClick={() => setAiAnalysis(null)}
                className="ml-auto p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="prose prose-invert max-w-none prose-p:text-stone-300 prose-headings:text-white prose-strong:text-amber-400 prose-sm lg:prose-base">
              <Markdown>{aiAnalysis}</Markdown>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="Tổng khách" value={stats.total} icon={Users} color="bg-blue-500" />
        <StatCard title="Check-in" value={stats.checkedIn} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Chờ" value={stats.pending} icon={Clock} color="bg-amber-500" />
        <StatCard title="Đã gửi" value={stats.emailsSent} icon={Mail} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-base lg:text-lg font-semibold text-stone-800 mb-6">Check-in theo thời gian</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-base lg:text-lg font-semibold text-stone-800 mb-6">Tỷ lệ tham dự</h3>
          <div className="h-40 lg:h-48 flex items-center justify-center mb-6 lg:mb-8">
             <div className="relative w-32 h-32 lg:w-40 lg:h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#f1f1f1" strokeWidth="10" fill="transparent" className="lg:hidden" />
                  <circle cx="80" cy="80" r="70" stroke="#f1f1f1" strokeWidth="12" fill="transparent" className="hidden lg:block" />
                  
                  <circle
                    cx="64" cy="64" r="56" stroke="#10b981" strokeWidth="10"
                    strokeDasharray={352}
                    strokeDashoffset={352 * (1 - attendanceRate / 100)}
                    strokeLinecap="round" fill="transparent"
                    className="transition-all duration-1000 ease-out lg:hidden"
                  />
                  <circle
                    cx="80" cy="80" r="70" stroke="#10b981" strokeWidth="12"
                    strokeDasharray={440}
                    strokeDashoffset={440 * (1 - attendanceRate / 100)}
                    strokeLinecap="round" fill="transparent"
                    className="transition-all duration-1000 ease-out hidden lg:block"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl lg:text-3xl font-bold text-stone-900">{attendanceRate}%</span>
                  <span className="text-[10px] lg:text-xs text-stone-500">Hoàn thành</span>
                </div>
             </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Hoạt động gần đây</h4>
            <div className="space-y-3">
              {recentActivity.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium text-stone-900 truncate">{a.name}</p>
                    <p className="text-[10px] lg:text-xs text-stone-500">
                      {a.checkinTime.toDate ? a.checkinTime.toDate().toLocaleTimeString() : new Date(a.checkinTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => openPreview(a)}
                    className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Xem vé mời"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-xs text-stone-400 text-center py-4 italic">Chưa có hoạt động nào</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Preview Modal */}
      {isPreviewOpen && previewAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl lg:rounded-[2.5rem] overflow-hidden relative shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsPreviewOpen(false)} className="absolute right-4 top-4 lg:right-6 lg:top-6 z-10 p-2 bg-white/80 backdrop-blur-md text-stone-400 hover:text-stone-600 rounded-full shadow-sm transition-all no-print">
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            
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
                  className="p-8 lg:p-12 text-white text-center space-y-2"
                  style={{ backgroundColor: eventSettings?.ticketColor || '#059669' }}
                >
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-4">
                    <QrCode className="w-6 h-6 lg:w-8 lg:h-8" />
                  </div>
                  <h3 className="text-xl lg:text-3xl font-bold tracking-tight uppercase">{eventSettings?.ticketTitle || 'VÉ MỜI SỰ KIỆN'}</h3>
                  <p className="text-xs lg:text-sm text-emerald-100 font-medium">{eventSettings?.ticketSubtitle || 'EventCheck SaaS Experience'}</p>
                </div>

                <div className="p-6 lg:p-10 space-y-6 lg:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Khách mời</p>
                      <p 
                        className="text-xl lg:text-2xl font-bold truncate"
                        style={{ 
                          fontFamily: eventSettings?.ticketNameFont || 'inherit',
                          color: eventSettings?.ticketNameColor || '#1c1917'
                        }}
                      >
                        {previewAttendee.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Công ty</p>
                      <p className="text-base lg:text-lg font-bold truncate">{previewAttendee.company || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Email</p>
                      <p className="text-sm lg:text-base truncate" style={{ opacity: 0.7 }}>{previewAttendee.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest" style={{ opacity: 0.5 }}>Mã vé</p>
                      <p className="text-sm lg:text-base font-mono" style={{ opacity: 0.7 }}>{previewAttendee.qrCode}</p>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col items-center justify-center p-6 lg:p-8 backdrop-blur-sm rounded-3xl border-2 border-dashed"
                    style={{ borderColor: `${eventSettings?.ticketBodyTextColor || '#1c1917'}20`, backgroundColor: `${eventSettings?.ticketBodyTextColor || '#1c1917'}05` }}
                  >
                    {qrImage ? (
                      <div className="space-y-4 text-center">
                        <img src={qrImage} alt="QR Code" className="w-32 h-32 lg:w-48 lg:h-48 mx-auto" />
                        <p className="text-[10px] lg:text-xs" style={{ opacity: 0.4 }}>Vui lòng xuất trình mã này tại cổng</p>
                      </div>
                    ) : (
                      <Loader2 className="w-8 h-8 lg:w-10 lg:h-10 text-emerald-500 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-10 pt-0 flex flex-col sm:flex-row gap-3 lg:gap-4 no-print">
              <button onClick={() => window.print()} className="flex-1 py-3 lg:py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 text-sm lg:text-base">
                In vé mời
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
