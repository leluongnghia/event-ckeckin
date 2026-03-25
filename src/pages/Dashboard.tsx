import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, Mail, Loader2, QrCode, X, Calendar, Sparkles, BrainCircuit, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

import { useParams } from 'react-router-dom';
import PageGuide from '../components/PageGuide';

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
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(attendee.qrCode);
      setQrImage(url);
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

  const exportToExcel = () => {
    if (attendeesData.length === 0) {
      alert("Không có dữ liệu để xuất báo cáo.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(attendeesData.map(a => ({
      'Tên': a.name,
      'Email': a.email,
      'Số điện thoại': a.phone || '',
      'Công ty': a.company || '',
      'VIP': a.isVIP ? 'Có' : 'Không',
      'Trạng thái': a.status === 'checked_in' ? 'Đã tham gia' : 'Chưa tham gia',
      'Thời gian Check-in': a.checkinTime ? (a.checkinTime.toDate ? a.checkinTime.toDate().toLocaleString('vi-VN') : new Date(a.checkinTime).toLocaleString('vi-VN')) : 'N/A',
      'Mã QR': a.qrCode
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo");
    const fileName = `Bao_cao_${eventSettings?.name || 'su_kien'}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
      <PageGuide 
        title="Tổng quan bảng điều khiển (Dashboard)"
        description="Nơi bạn có thể theo dõi tỷ lệ khách mời đã check-in theo thời gian thực, xem thống kê nhanh, và sử dụng AI để phân tích dữ liệu tham gia sự kiện."
      />
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
        <div className="flex gap-3 w-full lg:w-auto">
          <button
            onClick={exportToExcel}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl font-bold hover:bg-emerald-100 transition-all text-sm lg:text-base"
          >
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </button>
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 disabled:opacity-50 text-sm lg:text-base"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
            Phân tích bằng AI
          </button>
        </div>
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
                  {previewAttendee.name}
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
