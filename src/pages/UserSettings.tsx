import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Mail, Send, QrCode, ExternalLink, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

const defaultEmailTemplateHTML = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; background-color: #ffffff; color: #1f2937;">
  <!-- Header with branding -->
  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">
      {{EVENT_NAME}}
    </h1>
    <p style="color: #d1fae5; margin-top: 10px; font-size: 16px; font-weight: 500;">Xác nhận tham gia sự kiện chuyên nghiệp</p>
  </div>

  <div style="padding: 40px 30px;">
    <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Chào {{ATTENDEE_NAME}},</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; white-space: pre-wrap;">{{EVENT_DESC}}</p>

    <!-- Ticket Card -->
    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <div style="margin-bottom: 20px;">
        <img src="{{QR_CODE_IMG}}" style="width: 220px; height: 220px; border: 8px solid #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
      </div>
      <div style="display: inline-block; background-color: #111827; color: #ffffff; padding: 8px 20px; border-radius: 99px; font-size: 14px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">
        {{QR_CODE_VAL}}
      </div>
    </div>

    <!-- Event Details Grid -->
    <div style="display: grid; gap: 20px; margin-bottom: 30px;">
      <div style="border-left: 4px solid #059669; padding-left: 16px;">
        <p style="margin: 0; font-size: 12px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Thời gian tổ chức</p>
        <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #111827;">{{EVENT_DATE}} | {{EVENT_TIME}}</p>
      </div>
      <div style="border-left: 4px solid #059669; padding-left: 16px; margin-top: 15px;">
        <p style="margin: 0; font-size: 12px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Địa điểm</p>
        <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #111827;">{{EVENT_LOCATION}}</p>
      </div>
    </div>

    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 16px; margin-bottom: 30px;">
      <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.5;">
        💡 <b>Mẹo nhỏ:</b> Bạn có thể chụp ảnh màn hình hoặc tải file đính kèm để dùng khi không có mạng Internet.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="https://maps.google.com/?q={{EVENT_LOCATION}}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 16px 32px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);">
        📍 Xem đường đi trên bản đồ
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0; font-size: 12px; color: #9ca3af;">Đây là email tự động từ hệ thống <b>EventCheck</b></p>
    <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af;">Vui lòng không phản hồi lại email này.</p>
  </div>
</div>
`.trim();

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
    smtpFrom: '',
    customEmailMessage: '',
    emailTemplateHTML: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<'preview' | 'visual' | 'code'>('preview');

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
            smtpFrom: data.smtpFrom || auth.currentUser?.email || '',
            customEmailMessage: data.customEmailMessage || 'Chúng tôi rất vui mừng xác nhận bạn đã đăng ký thành công cho sự kiện sắp tới. Dưới đây là Vé mời điện tử chính thức của bạn. Vui lòng lưu lại mã này để thực hiện check-in nhanh chóng tại cổng.',
            emailTemplateHTML: data.emailTemplateHTML || defaultEmailTemplateHTML
          }));
        } else {
          // New user, set defaults
          setUserData(prev => ({
            ...prev,
            smtpHost: 'smtp.gmail.com',
            smtpPort: '587',
            smtpUser: auth.currentUser?.email || '',
            smtpFrom: auth.currentUser?.email || '',
            customEmailMessage: 'Chúng tôi rất vui mừng xác nhận bạn đã đăng ký thành công cho sự kiện sắp tới. Dưới đây là Vé mời điện tử chính thức của bạn. Vui lòng lưu lại mã này để thực hiện check-in nhanh chóng tại cổng.',
            emailTemplateHTML: defaultEmailTemplateHTML
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
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
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
              
              <div className="md:col-span-2 bg-stone-100 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2 mb-2">
                <p className="font-bold text-stone-900 border-b border-stone-300 pb-1 inline-block mb-1">Hướng dẫn cấu hình gửi mail bằng Gmail:</p>
                <ol className="list-decimal list-inside space-y-1.5 ml-1">
                  <li><strong>SMTP Host:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">smtp.gmail.com</code> và <strong>SMTP Port:</strong> <code className="bg-white px-1 py-0.5 rounded text-rose-500 font-mono">587</code>.</li>
                  <li><strong>SMTP User:</strong> Địa chỉ Gmail của bạn làm mail vãng lai gửi đi.</li>
                  <li><strong>SMTP Password:</strong> BẮT BUỘC dùng <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Mật khẩu Ứng dụng</a> 16 chữ số do Google cấp.</li>
                </ol>
              </div>

              <div className="md:col-span-2 border-t border-stone-100 pt-4 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2 mb-2">
                  <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> 
                    {editorMode === 'preview' && "Bản xem trước Giao diện Email Gửi Khách"}
                    {editorMode === 'visual' && "Chỉnh sửa Giao diện Trực quan"}
                    {editorMode === 'code' && "Chỉnh sửa Mã nguồn HTML"}
                  </label>
                  
                  <div className="flex gap-2 items-center bg-stone-100 p-1 rounded-xl w-max">
                    <button onClick={() => setEditorMode('preview')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${editorMode === 'preview' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Xem trước</button>
                    <button onClick={() => setEditorMode('visual')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${editorMode === 'visual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Sửa trực quan</button>
                    <button onClick={() => setEditorMode('code')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${editorMode === 'code' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>Sửa Code</button>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] lg:text-xs text-stone-400 italic max-w-[70%]">
                    {editorMode === 'preview' && "Đây là giao diện mặc định hệ thống sẽ tự động tạo và gửi cho khách mời của bạn (thông tin bên dưới chỉ là minh họa mẫu). Nội dung 'Lời mở đầu' bạn nhập ở trên sẽ được chèn vào ngay bên dưới câu chào 'Chào Tên Khách'."}
                    {editorMode === 'visual' && "Bạn có thể nhấp trực tiếp vào khung nội dung bên dưới để sửa chữ. Vui lòng KHÔNG sửa các TỪ KHOÁ trong cặp ngoặc kép {{...}} để hệ thống tự động chèn dữ liệu. Khung thiết kế có thể hơi lỗi nếu bạn bấm <Enter> làm vỡ cấu trúc HTML."}
                    {editorMode === 'code' && "Dành cho người dùng rành về HTML/CSS. Sửa trực tiếp cấu trúc HTML của thẻ."}
                  </p>
                  <button onClick={() => setUserData({ ...userData, emailTemplateHTML: defaultEmailTemplateHTML })} className="text-[10px] lg:text-xs text-stone-500 hover:text-emerald-600 transition-colors font-semibold bg-stone-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-stone-200">
                    ↻ Khôi phục bản gốc
                  </button>
                </div>

                {editorMode === 'code' ? (
                  <textarea 
                    rows={20} 
                    className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-sm font-mono text-emerald-400"
                    placeholder="Mã HTML cho sự kiện của bạn..."
                    value={userData.emailTemplateHTML || ''} 
                    onChange={e => setUserData({ ...userData, emailTemplateHTML: e.target.value })} 
                  />
                ) : (
                  <div 
                    className={`w-full bg-stone-50 border rounded-2xl max-w-full overflow-hidden shadow-inner flex justify-center py-4 sm:py-8 transition-colors ${editorMode === 'visual' ? 'border-sky-400 ring-2 ring-sky-400/20' : 'border-stone-200'} `}
                  >
                    <div className="w-full max-w-full overflow-x-auto px-2 sm:px-8">
                      <div 
                        className="min-w-[400px]"
                        contentEditable={editorMode === 'visual'}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          if (editorMode === 'visual') {
                            setUserData({ ...userData, emailTemplateHTML: e.currentTarget.innerHTML });
                          }
                        }}
                        dangerouslySetInnerHTML={{
                          __html: editorMode === 'preview' 
                            ? (userData.emailTemplateHTML || defaultEmailTemplateHTML)
                                .replace(/\{\{ATTENDEE_NAME\}\}/g, 'Nguyễn Văn A')
                                .replace(/\{\{EVENT_NAME\}\}/g, 'TÊN SỰ KIỆN MẪU')
                                .replace(/\{\{EVENT_DATE\}\}/g, '25/12/2026')
                                .replace(/\{\{EVENT_TIME\}\}/g, '08:00 AM')
                                .replace(/\{\{EVENT_LOCATION\}\}/g, 'Trung tâm Hội nghị Quốc gia')
                                .replace(/\{\{EVENT_DESC\}\}/g, userData.customEmailMessage || 'Nội dung lời mở đầu của bạn sẽ xuất hiện tại đây...')
                                .replace(/\{\{QR_CODE_VAL\}\}/g, 'VIP-123456')
                                .replace(/src="\{\{QR_CODE_IMG\}\}"/g, 'src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=VIP-123456"')
                            : (userData.emailTemplateHTML || defaultEmailTemplateHTML)
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="text-[10px] sm:text-xs text-stone-500 space-y-1 bg-stone-100 p-3 rounded-xl border border-stone-200 mt-4">
                  <p className="font-bold text-stone-700 border-b border-stone-200 pb-1 mb-2">Các biến số Động hỗ trợ chèn vào mẫu:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}ATTENDEE_NAME{'}'}{'}'}</code>: Tên khách mời</p>
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}EVENT_NAME{'}'}{'}'}</code>: Tên sự kiện</p>
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}EVENT_DATE{'}'}{'}'}</code>: Ngày tổ chức</p>
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}EVENT_TIME{'}'}{'}'}</code>: Giờ tổ chức</p>
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}EVENT_LOCATION{'}'}{'}'}</code>: Địa điểm</p>
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}EVENT_DESC{'}'}{'}'}</code>: Tự động chèn "Lời mở đầu"</p>
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}QR_CODE_IMG{'}'}{'}'}</code>: (Đặc biệt) Dùng làm thuộc tính <span className="font-bold text-stone-600">src</span> của thẻ Ảnh</p>
                    <p><code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono font-bold shadow-sm border border-stone-200">{'{'}{'{'}QR_CODE_VAL{'}'}{'}'}</code>: Mã số vé (Text)</p>
                  </div>
                </div>
              </div>
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
