import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase, firebaseConfig.firestoreDatabaseId);

async function getTransporter(eventId: string) {
  const eventDoc = await getDoc(doc(db, 'events', eventId));
  const settings = eventDoc.exists() ? eventDoc.data() : {};

  if (settings.smtpHost && settings.smtpUser && settings.smtpPass) {
    return nodemailer.createTransport({
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort || "587"),
      secure: settings.smtpPort == '465',
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "placeholder@example.com",
      pass: process.env.SMTP_PASS || "placeholder_pass",
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "EventCheck API is running" });
  });

  app.post("/api/qr/generate", async (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "Data is required" });
    
    try {
      const QRCode = (await import("qrcode")).default;
      const qrImage = await QRCode.toDataURL(data);
      res.json({ qrImage });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  app.post("/api/email/send-batch", async (req, res) => {
    const { attendees, eventId } = req.body;
    if (!Array.isArray(attendees) || !eventId) return res.status(400).json({ error: "Attendees list and eventId are required" });

    console.log(`Starting email batch for ${attendees.length} attendees...`);
    const mailer = await getTransporter(eventId);
    
    // Fetch event settings to get 'from' email
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    const settings = eventDoc.exists() ? eventDoc.data() : {};
    const fromEmail = settings.smtpFrom || '"EventCheck" <noreply@eventcheck.com>';
    
    try {
      for (const attendee of attendees) {
        const QRCode = (await import("qrcode")).default;
        const qrImage = await QRCode.toDataURL(attendee.qrCode);
        
        const mailOptions = {
          from: fromEmail,
          to: attendee.email,
          subject: `Vé mời tham gia sự kiện - ${attendee.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #059669;">Chào ${attendee.name},</h2>
              <p>Cảm ơn bạn đã đăng ký tham gia sự kiện của chúng tôi. Dưới đây là vé mời điện tử của bạn:</p>
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 10px;">
                <img src="cid:qrcode" style="width: 200px; height: 200px;" />
                <p style="font-weight: bold; margin-top: 10px; color: #374151;">Mã vé: ${attendee.qrCode}</p>
              </div>
              <p>Vui lòng mang theo mã QR này để thực hiện check-in tại cổng sự kiện.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
            </div>
          `,
          attachments: [{
            filename: 'qrcode.png',
            content: qrImage.split("base64,")[1],
            encoding: 'base64',
            cid: 'qrcode'
          }]
        };

        // In production, use a queue like BullMQ
        if (settings.smtpUser && settings.smtpPass) {
          await mailer.sendMail(mailOptions);
        } else {
          console.log(`[SIMULATION] Email sent to: ${attendee.email}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      res.json({ success: true, message: `Successfully processed ${attendees.length} emails.` });
    } catch (error) {
      console.error("Email batch failed", error);
      res.status(500).json({ error: "Failed to send email batch" });
    }
  });

  app.post("/api/event/report", async (req, res) => {
    const { eventId, targetEmail } = req.body;
    if (!eventId || !targetEmail) return res.status(400).json({ error: "Event ID and target email are required" });

    console.log(`Generating report for event ${eventId} and sending to ${targetEmail}...`);
    const mailer = await getTransporter(eventId);
    
    // Fetch event settings to get 'from' email
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    const settings = eventDoc.exists() ? eventDoc.data() : {};
    const fromEmail = settings.smtpFrom || '"EventCheck Reports" <reports@eventcheck.com>';
    
    try {
      // In a real app, we would fetch data from Firestore here
      // For simulation, we'll use a template
      const mailOptions = {
        from: fromEmail,
        to: targetEmail,
        subject: `Báo cáo tổng kết sự kiện - ${eventId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 800px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 20px; background: #fff;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #059669; margin: 0; font-size: 32px;">BÁO CÁO TỔNG KẾT SỰ KIỆN</h1>
              <p style="color: #6b7280; font-size: 16px; margin-top: 10px;">Mã sự kiện: ${eventId}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
              <div style="background: #f9fafb; padding: 20px; border-radius: 15px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Tổng khách mời</p>
                <p style="color: #111827; font-size: 24px; font-weight: bold; margin: 5px 0;">150</p>
              </div>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 15px; text-align: center;">
                <p style="color: #059669; font-size: 14px; margin: 0;">Đã check-in</p>
                <p style="color: #059669; font-size: 24px; font-weight: bold; margin: 5px 0;">132 (88%)</p>
              </div>
            </div>

            <div style="margin-bottom: 40px;">
              <h3 style="color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Thống kê theo phiên</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="text-align: left; color: #6b7280; font-size: 14px;">
                    <th style="padding: 10px 0;">Tên phiên</th>
                    <th style="padding: 10px 0;">Số người tham dự</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 15px 0; color: #374151;">Hội thảo AI & Future</td>
                    <td style="padding: 15px 0; color: #111827; font-weight: bold;">85</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 15px 0; color: #374151;">Workshop Design Thinking</td>
                    <td style="padding: 15px 0; color: #111827; font-weight: bold;">42</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 10px;">
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: bold;">Ghi chú:</p>
              <p style="color: #92400e; font-size: 14px; margin: 5px 0;">Báo cáo này được tạo tự động bởi hệ thống EventCheck. Vui lòng kiểm tra chi tiết hơn trong trang quản trị.</p>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 EventCheck SaaS. All rights reserved.</p>
          </div>
        `
      };

      if (settings.smtpUser && settings.smtpPass) {
        await mailer.sendMail(mailOptions);
      } else {
        console.log(`[SIMULATION] Report email sent to: ${targetEmail}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      res.json({ success: true, message: `Report sent to ${targetEmail}` });
    } catch (error) {
      console.error("Report generation/sending failed", error);
      res.status(500).json({ error: "Failed to send report" });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    const { eventId, data } = req.body;
    // In a real app, this would generate a PDF or Excel file on the server
    // For now, we'll just acknowledge the request
    res.json({ success: true, message: `Report for ${eventId} generated.` });
  });

  app.post("/api/zalo/send-zns", async (req, res) => {
    const { phone, templateId, templateData, accessToken } = req.body;
    
    if (!phone || !templateId || !accessToken) {
      return res.status(400).json({ error: "Phone, templateId, and accessToken are required" });
    }

    // Format phone number for Zalo (must be 84...)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '84' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('84')) {
      formattedPhone = '84' + formattedPhone;
    }

    console.log(`Sending Zalo ZNS to ${formattedPhone} using template ${templateId}...`);

    try {
      const axios = (await import("axios")).default;
      const response = await axios.post(
        "https://openapi.zalo.me/v2.0/oa/message/template",
        {
          phone: formattedPhone,
          template_id: templateId,
          template_data: templateData || {}
        },
        {
          headers: {
            "access_token": accessToken,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.error !== 0) {
        console.error("Zalo API Error:", response.data);
        return res.status(400).json({ error: response.data.message, code: response.data.error });
      }

      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Zalo ZNS request failed", error.message);
      res.status(500).json({ error: "Failed to send Zalo ZNS" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
