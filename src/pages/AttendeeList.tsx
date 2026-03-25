import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Plus, Mail, Trash2, Loader2, QrCode, X, Edit2, FileSpreadsheet, Link as LinkIcon, FileText, Eye, CheckSquare, Square, Zap, Users, Crown, Image as ImageIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, serverTimestamp, writeBatch, updateDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  status: 'registered' | 'checked_in';
  qrCode: string;
  emailSent?: boolean;
  zaloSent?: boolean;
  isVIP?: boolean;
  isSVIP?: boolean;
  checkinTime?: any;
}

import { useVirtualizer } from '@tanstack/react-virtual';
import { Star, MessageCircle } from 'lucide-react';
import { sendZaloNotification } from '../utils/notifications';
import PageGuide from '../components/PageGuide';
import { TEMPLATES, renderTemplate } from '../utils/templates';

export default function AttendeeList() {
  const { eventId = 'default-event' } = useParams();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAttendee, setPreviewAttendee] = useState<Attendee | null>(null);
  const [eventSettings, setEventSettings] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkQrLoading, setBulkQrLoading] = useState(false);
  const [bulkZaloLoading, setBulkZaloLoading] = useState(false);
  const [bulkZaloProgress, setBulkZaloProgress] = useState('');

  const parentRef = React.useRef<HTMLDivElement>(null);

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
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Attendee[];
      setAttendees(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [eventId]);

  const filteredAttendees = attendees.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rowVirtualizer = useVirtualizer({
    count: filteredAttendees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 73, // Height of a row
    overscan: 5,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<Partial<Attendee> | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const path = `events/${eventId}/attendees`;

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processImportedData(results.data);
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        await processImportedData(data);
      };
      reader.readAsBinaryString(file);
    }
    
    // Reset input
    e.target.value = '';
  };

  const processImportedData = async (data: any[]) => {
    const path = `events/${eventId}/attendees`;
    const batch = writeBatch(db);
    let count = 0;
    
    data.forEach(row => {
      const name = row.name || row['Tên'] || row['Họ tên'];
      const email = row.email || row['Email'];
      const phone = row.phone || row['Số điện thoại'] || row['SĐT'] || '';
      const company = row.company || row['Công ty'] || '';
      
      // Nhận diện cột VIP từ dữ liệu Excel (hỗ trợ nhiều định dạng từ khóa)
      const vipValue = row.isVIP || row['VIP'] || row['Loại khách'] || row['Khách VIP'] || '';
      const stringVipValue = String(vipValue).trim().toLowerCase();
      const isVIP = stringVipValue === 'true' || 
                    stringVipValue === 'x' || 
                    stringVipValue === 'yes' || 
                    stringVipValue === 'có' || 
                    stringVipValue === '1' ||
                    stringVipValue === 'vip';

      if (name && email) {
        const newDocRef = doc(collection(db, path));
        batch.set(newDocRef, {
          name,
          email,
          phone,
          company,
          isVIP: !!isVIP,
          status: 'registered',
          qrCode: Math.random().toString(36).substring(7),
          createdAt: serverTimestamp()
        });
        count++;
      }
    });

    if (count > 0) {
      try {
        await batch.commit();
        alert(`Đã nhập thành công ${count} khách mời.`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else {
      alert("Không tìm thấy dữ liệu hợp lệ trong file. Vui lòng kiểm tra lại định dạng (cần có cột 'name' và 'email').");
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Tên': 'Nguyen Van A', 'Email': 'a@example.com', 'Số điện thoại': '0901234567', 'Công ty': 'Cong ty A', 'VIP': 'x' },
      { 'Tên': 'Tran Thi B', 'Email': 'b@example.com', 'Số điện thoại': '0987654321', 'Công ty': 'Cong ty B', 'VIP': '' }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Mau_danh_sach_khach_moi.xlsx");
  };

  const handleSaveAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttendee?.name || !editingAttendee?.email) return;

    const path = `events/${eventId}/attendees`;
    try {
      if (editingAttendee.id) {
        // Update
        const docRef = doc(db, `${path}/${editingAttendee.id}`);
        await updateDoc(docRef, {
          name: editingAttendee.name,
          email: editingAttendee.email,
          phone: editingAttendee.phone || '',
          company: editingAttendee.company || '',
          isVIP: !!editingAttendee.isVIP
        });
      } else {
        // Create
        await addDoc(collection(db, path), {
          ...editingAttendee,
          phone: editingAttendee.phone || '',
          isVIP: !!editingAttendee.isVIP,
          status: 'registered',
          qrCode: Math.random().toString(36).substring(7),
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setEditingAttendee(null);
    } catch (error) {
      handleFirestoreError(error, editingAttendee.id ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const openAddModal = () => {
    setEditingAttendee({ name: '', email: '', company: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (attendee: Attendee) => {
    setEditingAttendee(attendee);
    setIsModalOpen(true);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(attendees.map(a => ({
      'Tên': a.name,
      'Email': a.email,
      'Công ty': a.company,
      'Trạng thái': a.status === 'checked_in' ? 'Đã tham gia' : 'Chưa tham gia',
      'Thời gian Check-in': a.checkinTime ? (a.checkinTime.toDate ? a.checkinTime.toDate().toLocaleString() : new Date(a.checkinTime).toLocaleString()) : 'N/A',
      'Mã QR': a.qrCode
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
    XLSX.writeFile(workbook, `Bao_cao_su_kien_${new Date().toLocaleDateString()}.xlsx`);
  };

  const openPreview = async (attendee: Attendee) => {
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

  const showQrCode = async (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setQrImage(null);
    try {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(attendee.qrCode);
      setQrImage(url);
    } catch (error) {
      console.error("Failed to generate QR", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách mời này?")) {
      const path = `events/${eventId}/attendees/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/register/${eventId}`;
    navigator.clipboard.writeText(link);
    alert("Đã sao chép link đăng ký vào bộ nhớ tạm!");
  };

  const copyCheckinLink = () => {
    const link = `${window.location.origin}/checkin/${eventId}`;
    navigator.clipboard.writeText(link);
    alert("Đã sao chép link Cổng Check-in (PG) vào bộ nhớ tạm!");
  };

  const [sendingZalo, setSendingZalo] = useState<string | null>(null);

  const handleSendZalo = async (attendee: Attendee) => {
    if (!eventSettings?.zaloAccessToken || !eventSettings?.zaloTemplateId) {
      alert("Vui lòng cấu hình Zalo ZNS trong phần Cài đặt trước.");
      return;
    }

    if (!attendee.phone) {
      alert("Khách mời này chưa có số điện thoại.");
      return;
    }

    setSendingZalo(attendee.id);
    try {
      const result = await sendZaloNotification(
        attendee.phone,
        eventSettings.zaloTemplateId,
        eventSettings.zaloAccessToken,
        {
          name: attendee.name,
          event_name: eventSettings.name || 'Sự kiện',
          qr_code: attendee.qrCode,
          location: eventSettings.location || 'Địa điểm sự kiện',
          date: eventSettings.startDate || 'Ngày sự kiện'
        }
      );

      if (result.success) {
        const path = `events/${eventId}/attendees/${attendee.id}`;
        await updateDoc(doc(db, path), { zaloSent: true });
        alert(`Đã gửi thông báo Zalo cho ${attendee.name} thành công!`);
      } else {
        alert(`Lỗi khi gửi Zalo: ${result.error}`);
      }
    } catch (error) {
      console.error("Zalo error:", error);
      alert("Lỗi hệ thống khi gửi Zalo.");
    } finally {
      setSendingZalo(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAttendees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAttendees.map(a => a.id)));
    }
  };

  const handleBulkQR = async () => {
    const targets = filteredAttendees.filter(a => selectedIds.has(a.id));
    if (targets.length === 0) return;
    setBulkQrLoading(true);
    try {
      const QRCode = (await import('qrcode')).default;
      // Generate each QR as dataURL and trigger individual download
      for (const a of targets) {
        const dataUrl: string = await QRCode.toDataURL(a.qrCode, { width: 300, margin: 2 });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `QR_${a.name.replace(/\s+/g, '_')}.png`;
        link.click();
        await new Promise(r => setTimeout(r, 150));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo QR hàng loạt.');
    } finally {
      setBulkQrLoading(false);
    }
  };

  const handleBulkZalo = async () => {
    if (!eventSettings?.zaloAccessToken || !eventSettings?.zaloTemplateId) {
      alert('Vui lòng cấu hình Zalo ZNS trong phần Cài đặt trước.');
      return;
    }
    const targets = filteredAttendees.filter(a => selectedIds.has(a.id) && a.phone);
    if (targets.length === 0) {
      alert('Không có khách mời nào được chọn có số điện thoại.');
      return;
    }
    if (!confirm(`Gửi Zalo ZNS cho ${targets.length} khách mời?`)) return;
    setBulkZaloLoading(true);
    let ok = 0; let fail = 0;
    for (let i = 0; i < targets.length; i++) {
      const a = targets[i];
      setBulkZaloProgress(`Đang gửi ${i + 1}/${targets.length}: ${a.name}`);
      try {
        const result = await sendZaloNotification(
          a.phone!,
          eventSettings.zaloTemplateId,
          eventSettings.zaloAccessToken,
          { name: a.name, event_name: eventSettings.name || 'Sự kiện', qr_code: a.qrCode, location: eventSettings.location || '', date: eventSettings.startDate || '' }
        );
        if (result.success) {
          await updateDoc(doc(db, `events/${eventId}/attendees/${a.id}`), { zaloSent: true });
          ok++;
        } else { fail++; }
      } catch { fail++; }
      // Throttle to avoid rate limit
      await new Promise(r => setTimeout(r, 300));
    }
    setBulkZaloLoading(false);
    setBulkZaloProgress('');
    alert(`Hoàn tất! Thành công: ${ok}, Thất bại: ${fail}.`);
  };

  const handleBulkMarkVIP = async (isVIP: boolean, isSVIP: boolean) => {
    if (selectedIds.size === 0) return;
    const path = `events/${eventId}/attendees`;
    const batch = writeBatch(db);
    selectedIds.forEach(id => {
      const docRef = doc(db, path, id);
      batch.update(docRef, { isVIP, isSVIP });
    });
    try {
      await batch.commit();
      alert(`Đã cập nhật trạng thái VIP/SVIP cho ${selectedIds.size} khách mời.`);
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
      alert('Lỗi cập nhật VIP/SVIP');
    }
  };

  return (
    <div className="space-y-6">
      {/* Giới thiệu tính năng */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl border border-stone-200 shadow-sm space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Users className="w-48 h-48 text-emerald-900" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-stone-900">Tính năng Quản lý Khách mời</h3>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm text-stone-600">
          <div className="flex items-start gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p><span className="font-bold text-stone-800">Tìm kiếm & Theo dõi:</span> Quản lý toàn bộ danh sách xem ai đã đến và ai chưa đến theo thời gian thực.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p><span className="font-bold text-stone-800">Thêm thủ công / Import:</span> Bổ sung khách lẻ nhanh chóng hoặc nhập hàng loạt từ danh sách Excel có sẵn.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p><span className="font-bold text-stone-800">Tạo mã QR & Vé mời:</span> Tạo ngay vé check-in kèm QR tự động, hỗ trợ tải về hoặc in trực tiếp.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p><span className="font-bold text-stone-800">Gửi tự động Zalo ZNS:</span> Gắn kết tức thì và tự động gửi thông báo vé mời qua Zalo cá nhân của khách.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p><span className="font-bold text-stone-800">Link Check-in / Đăng ký:</span> Lấy link điền form đăng ký online hoặc link cho PG lấy máy quét soát vé.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p><span className="font-bold text-stone-800">Khách VIP & Báo cáo:</span> Đánh dấu khách VIP, lọc và xuất dữ liệu thống kê ra file Excel chuẩn.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khách mời..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          <button onClick={copyRegistrationLink} className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50 transition-all whitespace-nowrap shrink-0" title="Sao chép link đăng ký công khai">
            <LinkIcon className="w-4 h-4" />
            Link đăng ký
          </button>
          <button onClick={copyCheckinLink} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all whitespace-nowrap shrink-0" title="Sao chép link Cổng Check-in (PG)">
            <QrCode className="w-4 h-4" />
            Link Check-in (PG)
          </button>
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50 transition-all whitespace-nowrap shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
            Mẫu Excel
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50 transition-all whitespace-nowrap shrink-0">
            <FileText className="w-4 h-4" />
            Báo cáo
          </button>
          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer transition-all whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" />
            Import
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          </label>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-all whitespace-nowrap shrink-0" onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Bulk Actions Menu */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3">
            <span className="text-emerald-800 font-bold whitespace-nowrap">Đã chọn ({selectedIds.size}) khách mời</span>
            <button onClick={() => setSelectedIds(new Set())} className="text-sm text-emerald-600 hover:text-emerald-800 underline">Bỏ chọn tất cả</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleBulkQR} disabled={bulkQrLoading} className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-all flex items-center gap-2">
              {bulkQrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />} Tạo QR
            </button>
            <button onClick={handleBulkZalo} disabled={bulkZaloLoading} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-all flex items-center gap-2">
              {bulkZaloLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />} Gửi Zalo ({bulkZaloProgress || `${selectedIds.size}`})
            </button>
            <button onClick={() => handleBulkMarkVIP(true, false)} className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-all flex items-center gap-2">
              <Star className="w-4 h-4" /> Đánh dấu VIP
            </button>
            <button onClick={() => handleBulkMarkVIP(false, true)} className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-all flex items-center gap-2">
              <Crown className="w-4 h-4" /> Đánh dấu SVIP
            </button>
            <button onClick={() => handleBulkMarkVIP(false, false)} className="px-3 py-1.5 bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-sm font-semibold hover:bg-stone-200 transition-all flex items-center gap-2">
              <X className="w-4 h-4" /> Huỷ VIP/SVIP
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div ref={parentRef} className="hidden md:block max-h-[600px] overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-stone-50 z-10">
                  <tr className="border-b border-stone-200">
                    <th className="px-6 py-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        checked={selectedIds.size === filteredAttendees.length && filteredAttendees.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Khách mời</th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Công ty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody 
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const attendee = filteredAttendees[virtualRow.index];
                    return (
                      <tr 
                        key={attendee.id} 
                        className={`hover:bg-stone-50/50 transition-colors absolute top-0 left-0 w-full border-b border-stone-100 ${selectedIds.has(attendee.id) ? 'bg-emerald-50/50' : ''}`}
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            checked={selectedIds.has(attendee.id)}
                            onChange={() => toggleSelect(attendee.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-medium text-stone-900 flex items-center gap-2">
                                {attendee.name}
                                {attendee.isSVIP && <Crown className="w-4 h-4 fill-purple-500 text-purple-500 shrink-0" />}
                                {!attendee.isSVIP && attendee.isVIP && <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />}
                              </p>
                              <p className="text-xs text-stone-500">{attendee.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-600">{attendee.company}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attendee.status === 'checked_in' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {attendee.status === 'checked_in' ? 'Đã tham gia' : 'Chưa tham gia'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openPreview(attendee)} className="flex items-center gap-2 px-3 py-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all text-xs font-bold" title="Xem vé mời">
                              <QrCode className="w-4 h-4" />
                              Tạo vé
                            </button>
                            <button 
                              onClick={() => handleSendZalo(attendee)} 
                              disabled={sendingZalo === attendee.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                                attendee.zaloSent 
                                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                                  : 'text-stone-600 bg-stone-50 hover:bg-stone-100'
                              }`}
                              title="Gửi Zalo ZNS"
                            >
                              {sendingZalo === attendee.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <MessageCircle className="w-4 h-4" />
                              )}
                              Zalo
                            </button>
                            <button onClick={() => openEditModal(attendee)} className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Chỉnh sửa">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" onClick={() => handleDelete(attendee.id)} title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-stone-100">
              {filteredAttendees.map((attendee) => (
                <div key={attendee.id} className={`p-4 space-y-3 ${selectedIds.has(attendee.id) ? 'bg-emerald-50/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="pt-1 select-none flex items-center h-full">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        checked={selectedIds.has(attendee.id)}
                        onChange={() => toggleSelect(attendee.id)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            {attendee.name}
                            {attendee.isSVIP && <Crown className="w-4 h-4 fill-purple-500 text-purple-500 shrink-0" />}
                            {!attendee.isSVIP && attendee.isVIP && <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />}
                          </p>
                          <p className="text-xs text-stone-500">{attendee.email}</p>
                          <p className="text-xs text-stone-600 mt-1">{attendee.company || 'N/A'}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          attendee.status === 'checked_in' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {attendee.status === 'checked_in' ? 'Đã tham gia' : 'Chưa tham gia'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 pl-8">
                    <button onClick={() => openPreview(attendee)} className="flex-1 flex items-center justify-center gap-2 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all text-xs font-bold">
                      <QrCode className="w-4 h-4" />
                      Tạo vé
                    </button>
                    <button 
                      onClick={() => handleSendZalo(attendee)}
                      disabled={sendingZalo === attendee.id}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all text-xs font-bold ${
                        attendee.zaloSent 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-stone-600 bg-stone-50'
                      }`}
                    >
                      {sendingZalo === attendee.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
                      )}
                      Zalo
                    </button>
                    <button onClick={() => openEditModal(attendee)} className="p-2 text-stone-400 bg-stone-50 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-stone-400 bg-stone-50 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" onClick={() => handleDelete(attendee.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredAttendees.length === 0 && (
              <div className="px-6 py-12 text-center text-stone-500">
                Không tìm thấy khách mời nào.
              </div>
            )}
          </>
        )}
      </div>

      {/* Attendee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-all">
              <X className="w-6 h-6" />
            </button>
            <h4 className="text-xl font-bold text-stone-900 mb-6">
              {editingAttendee?.id ? 'Chỉnh sửa khách mời' : 'Thêm khách mời mới'}
            </h4>
            <form onSubmit={handleSaveAttendee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">Họ tên</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={editingAttendee?.name || ''}
                  onChange={(e) => setEditingAttendee({ ...editingAttendee, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={editingAttendee?.email || ''}
                  onChange={(e) => setEditingAttendee({ ...editingAttendee, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="0901234567"
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={editingAttendee?.phone || ''}
                  onChange={(e) => setEditingAttendee({ ...editingAttendee, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-stone-700">Công ty</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  value={editingAttendee?.company || ''}
                  onChange={(e) => setEditingAttendee({ ...editingAttendee, company: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isVIP"
                  className="w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  checked={!!editingAttendee?.isVIP}
                  onChange={(e) => setEditingAttendee({ ...editingAttendee, isVIP: e.target.checked })}
                />
                <label htmlFor="isVIP" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <Star className={`w-4 h-4 ${editingAttendee?.isVIP ? 'fill-amber-400 text-amber-400' : 'text-stone-400'}`} />
                  Khách mời VIP
                </label>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Preview Modal */}
      {isPreviewOpen && previewAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl lg:rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Sticky header with close button */}
            <div className="flex items-center justify-end p-4 shrink-0">
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition-all no-print">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">

            <div id="printable-ticket" className="bg-stone-100 relative mx-auto overflow-hidden shadow-sm border border-stone-200" style={{ width: '100%', maxWidth: '400px', aspectRatio: '9/16' }}>
              {eventSettings?.ticketBgImage ? (
                <img src={eventSettings.ticketBgImage} alt="Background" className="w-full h-full object-cover select-none pointer-events-none" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                  <ImageIcon className="w-20 h-20 opacity-20" />
                </div>
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
            </div> {/* end printable ticket */}
            </div> {/* end scrollable content */}

            <div className="p-4 lg:p-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3 no-print shrink-0">
              <button onClick={() => window.print()} className="flex-1 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 text-sm">
                In vé mời
              </button>
              <button className="flex-1 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-bold hover:bg-emerald-100 transition-all text-sm">
                Gửi lại Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal (Deprecated in favor of Preview) */}
      {selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 relative shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setSelectedAttendee(null)} className="absolute right-4 top-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-all">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center space-y-6">
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-stone-900">{selectedAttendee.name}</h4>
                <p className="text-stone-500">{selectedAttendee.email}</p>
              </div>
              <div className="aspect-square bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100 p-4">
                {qrImage ? (
                  <img src={qrImage} alt="QR Code" className="w-full h-full" />
                ) : (
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                )}
              </div>
              <div className="pt-4">
                <button onClick={() => window.print()} className="w-full py-3 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all">
                  In vé mời
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
