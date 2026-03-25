// No @vercel/node needed – use plain Node.js IncomingMessage/ServerResponse types
type VercelRequest = any;
type VercelResponse = any;
import nodemailer from 'nodemailer';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Inline Firebase config to avoid relative path resolution issues in Vercel serverless
const firebaseConfig = {
  apiKey: "AIzaSyD_uCC_yHnYC5I73UX49nCRhyW2AQWl2CE",
  authDomain: "event-checkin-175c6.firebaseapp.com",
  projectId: "event-checkin-175c6",
  storageBucket: "event-checkin-175c6.firebasestorage.app",
  messagingSenderId: "844473449801",
  appId: "1:844473449801:web:10134c9a8150add7ee6e98",
};
const FIRESTORE_DB_ID = "(default)";

// Init Firebase (avoid double-init in serverless hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, FIRESTORE_DB_ID);

const DEFAULT_HTML = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; background-color: #ffffff; color: #1f2937;">
  <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">{{EVENT_NAME}}</h1>
    <p style="color: #d1fae5; margin-top: 10px; font-size: 16px; font-weight: 500;">Xác nhận tham gia sự kiện chuyên nghiệp</p>
  </div>
  <div style="padding: 40px 30px;">
    <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Chào {{ATTENDEE_NAME}},</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; white-space: pre-wrap;">{{EVENT_DESC}}</p>
    <div style="background-color: #f9fafb; border: 2px dashed #d1d5db; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 30px;">
      <div style="margin-bottom: 20px;">
        <img src="{{QR_CODE_IMG}}" style="display: block; margin: 0 auto; width: 220px; height: 220px; border: 8px solid #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
      </div>
      <div style="display: inline-block; background-color: #111827; color: #ffffff; padding: 8px 20px; border-radius: 99px; font-size: 14px; font-weight: 700; font-family: monospace; letter-spacing: 2px;">{{QR_CODE_VAL}}</div>
    </div>
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
      <p style="margin: 0; font-size: 14px; color: #065f46; line-height: 1.5;">💡 <b>Mẹo nhỏ:</b> Bạn có thể chụp ảnh màn hình hoặc tải file đính kèm để dùng khi không có mạng Internet.</p>
    </div>
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="{{TICKET_URL}}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 16px 32px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(17, 24, 39, 0.3);">🎫 Tải Thẻ Tham Dự (Bản Ảnh Đẹp)</a>
    </div>
    <div style="text-align: center;">
      <a href="https://maps.google.com/?q={{EVENT_LOCATION}}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 16px 32px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);">📍 Xem đường đi trên bản đồ</a>
    </div>
  </div>
  <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0; font-size: 12px; color: #9ca3af;">Đây là email tự động từ hệ thống <b>EventCheck</b></p>
    <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af;">Vui lòng không phản hồi lại email này.</p>
  </div>
</div>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { attendees, eventId } = req.body;
  if (!Array.isArray(attendees) || !eventId) {
    return res.status(400).json({ error: 'attendees and eventId are required' });
  }

  try {
    // Fetch event settings
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    let settings: any = eventDoc.exists() ? eventDoc.data() : {};

    // Merge with global user settings - USER SMTP takes absolute priority
    let userSmtp: any = {};
    if (settings.ownerId) {
      const userDoc = await getDoc(doc(db, 'users', settings.ownerId));
      if (userDoc.exists()) {
        const u = userDoc.data();
        userSmtp = u;
        // User SMTP takes absolute priority - only fall back to event SMTP if user has none
        const hasUserSmtp = u.smtpHost && u.smtpUser && u.smtpPass;
        settings = {
          ...settings,
          // If user has full SMTP config, use it entirely; otherwise try event-level
          smtpHost: hasUserSmtp ? u.smtpHost : (settings.smtpHost || u.smtpHost),
          smtpPort: hasUserSmtp ? (u.smtpPort || '587') : (settings.smtpPort || u.smtpPort || '587'),
          smtpUser: hasUserSmtp ? u.smtpUser : (settings.smtpUser || u.smtpUser),
          smtpPass: hasUserSmtp ? u.smtpPass : (settings.smtpPass || u.smtpPass),
          smtpFrom: u.smtpFrom || settings.smtpFrom || u.smtpUser || settings.smtpUser,
          emailTemplateHTML: u.emailTemplateHTML || settings.emailTemplateHTML,
          customEmailMessage: u.customEmailMessage || settings.customEmailMessage,
        };
      }
    }

    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
      return res.status(400).json({ error: 'Ch\u01b0a c\u1ea5u h\u00ecnh SMTP. Vui l\u00f2ng v\u00e0o C\u00e0i \u0111\u1eb7t chung \u0111\u1ec3 nh\u1eadp th\u00f4ng tin SMTP.' });
    }

    const mailer = nodemailer.createTransport({
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort || '587'),
      secure: settings.smtpPort === '465',
      auth: { user: settings.smtpUser, pass: settings.smtpPass },
    });

    const fromEmail = settings.smtpFrom || settings.smtpUser;
    const originUrl = req.headers.origin || `https://${req.headers.host}`;

    // Dynamically import qrcode (ESM-friendly in serverless)
    const QRCode = (await import('qrcode')).default;

    for (const attendee of attendees) {
      const qrImage = await QRCode.toDataURL(attendee.qrCode);
      const ticketUrl = `${originUrl}/ticket/${eventId}/${attendee.id}`;

      let emailHtml = settings.emailTemplateHTML || DEFAULT_HTML;
      emailHtml = emailHtml.replace(/\{\{ATTENDEE_NAME\}\}/g, attendee.name || '');
      emailHtml = emailHtml.replace(/\{\{EVENT_NAME\}\}/g, settings.name || 'THƯ MỜI THAM GIA');
      emailHtml = emailHtml.replace(/\{\{QR_CODE_IMG\}\}/g, 'cid:qrcode');
      emailHtml = emailHtml.replace(/\{\{QR_CODE_VAL\}\}/g, attendee.qrCode || '');
      emailHtml = emailHtml.replace(/\{\{EVENT_DATE\}\}/g, settings.date || settings.startDate || '');
      emailHtml = emailHtml.replace(/\{\{EVENT_TIME\}\}/g, settings.time || '');
      emailHtml = emailHtml.replace(/\{\{EVENT_LOCATION\}\}/g, settings.location || '');
      emailHtml = emailHtml.replace(/\{\{EVENT_DESC\}\}/g, settings.customEmailMessage || 'Chúng tôi trân trọng kính mời bạn tham dự sự kiện.');
      emailHtml = emailHtml.replace(/\{\{TICKET_URL\}\}/g, ticketUrl);

      await mailer.sendMail({
        from: fromEmail,
        to: attendee.email,
        subject: `🎟️ VÉ MỜI: ${settings.name || 'Sự kiện'} - ${attendee.name}`,
        html: emailHtml,
        attachments: [{
          filename: 'qrcode.png',
          content: qrImage.split('base64,')[1],
          encoding: 'base64',
          cid: 'qrcode'
        }]
      });
    }

    return res.status(200).json({ success: true, message: `Đã gửi ${attendees.length} email thành công.` });
  } catch (error: any) {
    console.error('Email batch error:', error);
    return res.status(500).json({ error: error.message || 'Lỗi không xác định khi gửi email' });
  }
}
