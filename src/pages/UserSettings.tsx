import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Mail, Send, QrCode, ExternalLink, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

export default function UserSettings() {
  const [userData, setUserData] = useState({
    telegramBotToken: '',
    telegramChatId: '',
    zaloAccessToken: '',
    zaloTemplateId: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(prev => ({ 
            ...prev, 
            ...data,
            // Prefill with defaults if missing
            smtpHost: data.smtpHost || 'smtp.gmail.com',
            smtpPort: data.smtpPort || '587',
            smtpUser: data.smtpUser || auth.currentUser?.email || '',
            smtpFrom: data.smtpFrom || auth.currentUser?.email || ''
          }));
        } else {
          // New user, set defaults
          setUserData(prev => ({
            ...prev,
            smtpHost: 'smtp.gmail.com',
            smtpPort: '587',
            smtpUser: auth.currentUser?.email || '',
            smtpFrom: auth.currentUser?.email || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching user settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...userData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert("Đã lưu cấu hình chung thành công!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <div className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-stone-200 shadow-sm space-y-6 lg:space-y-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-4 lg:pb-6">
          <SettingsIcon className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
          <h3 className="text-xl lg:text-2xl font-bold text-stone-900">Cấu hình chung</h3>
        </div>
        <p className="text-stone-500 text-sm">Các thiết lập tại đây sẽ được áp dụng chung cho toàn bộ sự kiện của bạn.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-500" />
              <h4 className="text-sm lg:text-base font-bold text-stone-900">Thông báo Telegram (VIP Check-in)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Bot Token</label>
                <input 
                  type="password" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Telegram Bot Token"
                  value={userData.telegramBotToken || ''}
                  onChange={(e) => setUserData({...userData, telegramBotToken: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Chat ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Telegram Chat ID"
                  value={userData.telegramChatId || ''}
                  onChange={(e) => setUserData({...userData, telegramChatId: e.target.value})}
                />
              </div>
            </div>
            <p className="text-[10px] lg:text-xs text-stone-400 italic">Hệ thống sẽ tự động gửi thông báo đến Telegram khi có khách mời VIP thực hiện check-in.</p>
          </div>

          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-600 rounded-lg">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-sm lg:text-base font-bold text-stone-900">Zalo Notification Service (ZNS)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Zalo Access Token</label>
                <input 
                  type="password" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Zalo Access Token"
                  value={userData.zaloAccessToken || ''}
                  onChange={(e) => setUserData({...userData, zaloAccessToken: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] lg:text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">ZNS Template ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm lg:text-base"
                  placeholder="Nhập Template ID"
                  value={userData.zaloTemplateId || ''}
                  onChange={(e) => setUserData({...userData, zaloTemplateId: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-3 bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-blue-900 border-b border-blue-200 pb-1 inline-block mb-1">Hướng dẫn lấy Zalo Access Token & ZNS Template ID:</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Truy cập <a href="https://developers.zalo.me/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">Zalo for Developers</a> và tạo Ứng dụng mới.</li>
                <li>Vào mục <strong>Tài liệu ZNS</strong> để liên kết Zalo Official Account (OA).</li>
                <li>Lấy <strong>Access Token</strong> của OA và <strong>Template ID</strong> (VD: 301234) dán vào đây để gửi vé tự động.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4 md:col-span-2 pt-6 border-t border-stone-100">
            <h4 className="text-sm lg:text-base font-bold text-stone-900">Cấu hình Email riêng (SMTP)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="SMTP Host (vd: smtp.gmail.com)" value={userData.smtpHost || ''} onChange={(e) => setUserData({...userData, smtpHost: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="text" placeholder="SMTP Port (vd: 587)" value={userData.smtpPort || ''} onChange={(e) => setUserData({...userData, smtpPort: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="text" placeholder="SMTP User (Email)" value={userData.smtpUser || ''} onChange={(e) => setUserData({...userData, smtpUser: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="password" placeholder="SMTP Password (App Password)" value={userData.smtpPass || ''} onChange={(e) => setUserData({...userData, smtpPass: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl" />
              <input type="email" placeholder="Email người gửi (From Email)" value={userData.smtpFrom || ''} onChange={(e) => setUserData({...userData, smtpFrom: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl md:col-span-2" />
            </div>
            
            <div className="mt-3 bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-stone-900 border-b border-stone-300 pb-1 inline-block mb-1">Hướng dẫn cấu hình gửi mail bằng Gmail:</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li><strong>SMTP Host:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">smtp.gmail.com</code> và <strong>SMTP Port:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">587</code>.</li>
                <li><strong>SMTP User:</strong> Địa chỉ Gmail của bạn làm mail vãng lai gửi đi.</li>
                <li><strong>SMTP Password:</strong> BẮT BUỘC dùng <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Mật khẩu Ứng dụng</a> 16 chữ số do Google cấp.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3 lg:gap-4 justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-70 text-sm lg:text-base"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
