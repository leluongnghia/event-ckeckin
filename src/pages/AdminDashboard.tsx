import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, collectionGroup, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Users, Mail, ShieldCheck, Download, Search, Loader2, Calendar, LayoutGrid, Settings as SettingsIcon, ToggleLeft, ToggleRight, MessageSquareWarning, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

const ADMIN_EMAILS = ['leluongnghia90@gmail.com', 'leluongnghia91@gmail.com'];

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function AdminDashboard() {
  const [allAttendees, setAllAttendees] = useState<any[]>([]);
  const [eventMap, setEventMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalAttendees: 0,
    totalEmailsSent: 0,
    totalEvents: 0
  });
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      if (!auth.currentUser?.email || !ADMIN_EMAILS.includes(auth.currentUser.email)) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch all events
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const eMap: Record<string, string> = {};
        events.forEach((e: any) => {
          eMap[e.id] = e.name;
        });
        setEventMap(eMap);
        
        // 2. Fetch all attendees using collectionGroup
        const attendeesSnapshot = await getDocs(collectionGroup(db, 'attendees'));
        const attendees = attendeesSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          eventId: doc.ref.parent.parent?.id // Get event ID from path
        }));

        setAllAttendees(attendees);
        setStats({
          totalAttendees: attendees.length,
          totalEmailsSent: attendees.filter((a: any) => a.emailSent).length,
          totalEvents: events.length
        });

        // 3. Fetch feedbacks
        const feedbacksSnapshot = await getDocs(query(collection(db, 'feedbacks')));
        const feedbackList = feedbacksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by createdAt descending
        feedbackList.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setFeedbacks(feedbackList);

        // 4. Fetch all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userList.sort((a: any, b: any) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.());
        setAllUsers(userList);

        // 5. Fetch global settings
        const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
        if (settingsDoc.exists()) {
          setGlobalSettings(settingsDoc.data());
        } else {
          // Default settings
          const defaultSettings = { requireVerification: true };
          await setDoc(doc(db, 'settings', 'global'), { ...defaultSettings, updatedAt: serverTimestamp() });
          setGlobalSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Admin fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const toggleVerification = async () => {
    if (!globalSettings || updatingSettings) return;
    setUpdatingSettings(true);
    try {
      const newValue = !globalSettings.requireVerification;
      await setDoc(doc(db, 'settings', 'global'), { 
        ...globalSettings, 
        requireVerification: newValue,
        updatedAt: serverTimestamp() 
      });
      setGlobalSettings({ ...globalSettings, requireVerification: newValue });
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setUpdatingSettings(false);
    }
  };

  const filteredAttendees = allAttendees.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone?.includes(searchTerm) ||
    (a.eventId && eventMap[a.eventId]?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportToCSV = () => {
    const headers = ['Tên', 'Email', 'Số điện thoại', 'Công ty', 'Sự kiện', 'Trạng thái', 'Email đã gửi'];
    const rows = filteredAttendees.map(a => [
      a.name,
      a.email,
      a.phone || '',
      a.company || '',
      a.eventId ? eventMap[a.eventId] || a.eventId : '',
      a.status,
      a.emailSent ? 'Có' : 'Không'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_khach_moi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUsersToCSV = () => {
    const filtered = allUsers.filter(u =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch)
    );
    const headers = ['Tên', 'Email', 'Số điện thoại', 'Công ty', 'Xác thực Email', 'Ngày đăng ký', 'Role'];
    const rows = filtered.map(u => [
      u.name || '',
      u.email || '',
      u.phone || '',
      u.company || '',
      u.isEmailVerified ? 'Có' : 'Chưa',
      u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('vi-VN') : 'N/A',
      u.role || 'user'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `danh_sach_user_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!auth.currentUser?.email || !ADMIN_EMAILS.includes(auth.currentUser.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-8">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-stone-900">Truy cập bị từ chối</h1>
          <p className="text-stone-500">Bạn không có quyền truy cập vào trang quản trị này.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-stone-900 text-white rounded-[1.5rem] shadow-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-stone-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-stone-500 font-medium mt-1">Tổng hợp dữ liệu toàn hệ thống</p>
            </div>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Xuất dữ liệu CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Tổng khách mời</p>
            </div>
            <h3 className="text-4xl font-black text-stone-900">{stats.totalAttendees}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Email đã gữi</p>
            </div>
            <h3 className="text-4xl font-black text-stone-900">{stats.totalEmailsSent}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Tổng sự kiện</p>
            </div>
            <h3 className="text-4xl font-black text-stone-900">{stats.totalEvents}</h3>
          </div>
        </div>

        {/* Global Settings Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-stone-100 text-stone-600 rounded-xl">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Cấu hình hệ thống</h3>
          </div>

          <div className="flex items-center justify-between p-6 bg-stone-50 rounded-2xl border border-stone-100">
            <div className="space-y-1">
              <p className="font-bold text-stone-900">Bắt buộc xác thực Email khi đăng ký</p>
              <p className="text-sm text-stone-500">Yêu cầu người dùng mới xác thực Email trước khi sử dụng hệ thống.</p>
              <p className="text-xs text-amber-600 font-medium">Lưu ý: Tài khoản Admin luôn được bỏ qua bước này.</p>
            </div>
            <button 
              onClick={toggleVerification}
              disabled={updatingSettings}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
                globalSettings?.requireVerification 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-stone-200 text-stone-600"
              )}
            >
              {updatingSettings ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : globalSettings?.requireVerification ? (
                <>
                  <ToggleRight className="w-6 h-6" />
                  Đang bật
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6" />
                  Đang tắt
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h3 className="text-xl font-bold text-stone-900">Danh sách khách mời toàn hệ thống</h3>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên, email, sđt..."
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Khách mời</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Liên hệ</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Sự kiện</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAttendees.map((a, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center font-bold text-stone-400">
                          {a.name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{a.name}</p>
                          <p className="text-xs text-stone-500">{a.company || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-stone-900">{a.email}</p>
                      <p className="text-xs text-stone-500">{a.phone || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                        <LayoutGrid className="w-3 h-3 text-stone-400" />
                        {a.eventId ? eventMap[a.eventId] || a.eventId : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        a.status === 'checked_in' 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {a.status === 'checked_in' ? 'Đã Check-in' : 'Chờ'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {a.emailSent ? (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs font-bold">Đã gửi</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-stone-300">Chưa gửi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAttendees.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-stone-400 font-medium italic">Không tìm thấy dữ liệu nào</p>
              </div>
            )}
          </div>
        </div>

        {/* System Users Section */}
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Danh sách User toàn hệ thống</h3>
                <p className="text-sm text-stone-400 font-medium">{allUsers.length} tài khoản</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên, email, sđt..."
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <button
                onClick={exportUsersToCSV}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Xuất CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Liên hệ</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Xác thực Email</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Ngày đăng ký</th>
                  <th className="px-8 py-5 text-xs font-bold text-stone-400 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {allUsers
                  .filter(u =>
                    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.phone?.includes(userSearch)
                  )
                  .map((u, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-sm">
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{u.name || 'N/A'}</p>
                          <p className="text-xs text-stone-400">{u.company || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-stone-700">{u.email}</p>
                      <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />{u.phone || 'Chưa có'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      {u.isEmailVerified ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Xác thực</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-bold">Chưa xác thực</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-xs text-stone-500 font-medium">
                      {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'admin' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allUsers.length === 0 && (
              <div className="p-16 text-center">
                <p className="text-stone-400 font-medium italic">Chưa có tài khoản nào.</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-stone-100 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Báo lỗi & Đề xuất ({feedbacks.length})</h3>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <p className="text-stone-500 text-center py-4">Chưa có báo cáo nào.</p>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="p-4 md:p-6 bg-stone-50 border border-stone-200 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 text-xs font-bold rounded-full w-max mt-1 md:mt-0",
                          fb.type === 'bug' ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {fb.type === 'bug' ? 'Báo lỗi' : 'Đề xuất'}
                        </span>
                        <h4 className="text-lg font-bold text-stone-900">{fb.title}</h4>
                      </div>
                      <span className="text-xs text-stone-500 hidden md:inline-block">
                        {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-stone-700 text-sm mt-3 whitespace-pre-wrap">{fb.description}</p>
                    <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                      <span className="font-medium text-stone-700">Gửi bởi: {fb.userEmail}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
