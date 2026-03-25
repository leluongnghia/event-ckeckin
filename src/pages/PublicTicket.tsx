import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Download, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function PublicTicket() {
  const { eventId, attendeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketData, setTicketData] = useState<any>(null);
  const [qrBase64, setQrBase64] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState<string>('9/16');
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        if (!eventId || !attendeeId) throw new Error("Link không hợp lệ");

        // Fetch Event config
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (!eventDoc.exists()) throw new Error("Không tìm thấy sự kiện");
        const eventInfo = eventDoc.data();

        // Fetch Attendee info
        const attendeeDoc = await getDoc(doc(db, `events/${eventId}/attendees/${attendeeId}`));
        if (!attendeeDoc.exists()) throw new Error("Không tìm thấy thông tin khách mời");
        const attendeeInfo = attendeeDoc.data();

        const qrDataUrl = await QRCode.toDataURL(attendeeInfo.qrCode, { margin: 1 });

        setTicketData({
          event: eventInfo,
          attendee: attendeeInfo,
        });
        setQrBase64(qrDataUrl);

        // Auto-detect aspect ratio from background image
        if (eventInfo.ticketBgImage) {
          const img = new Image();
          img.onload = () => setImageAspectRatio(`${img.width}/${img.height}`);
          img.src = eventInfo.ticketBgImage;
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [eventId, attendeeId]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
      // Use html-to-image to generate the image (we will load it dynamically via CDN since it's not in package.json, wait, no, we can just draw via canvas or import a lightweight script)
      // Actually since we don't have html2canvas installed, we can just use native html2canvas via a script tag injection or simple download. Let's try drawing to pure canvas manually if html2canvas is not present. But wait, modern browsers let you save a page or screenshot. Let's dynamically load html2canvas.
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        // @ts-ignore
        window.html2canvas(ticketRef.current, { scale: 2, useCORS: true, allowTaint: true }).then((canvas: HTMLCanvasElement) => {
          const link = document.createElement('a');
          link.download = `Ve_Moi_${ticketData.attendee.name.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setIsDownloading(false);
        });
      };
      document.body.appendChild(script);

    } catch (err) {
      console.error(err);
      alert("Tải xuống thất bại. Bạn có thể chụp màn hình lại thẻ này.");
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 p-6 text-center">
        <div className="bg-stone-800 p-8 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Rất tiếc</h2>
          <p className="text-stone-400">{error}</p>
        </div>
      </div>
    );
  }

  const { event, attendee } = ticketData;

  // Use the designed positions and styling
  const bgImage = event.ticketBgImage;
  const nameFont = event.ticketNameFont || "'Inter', sans-serif";
  const nameColor = event.ticketNameColor || "#1c1917";
  const nameSize = event.nameFontSize || 24;
  const nameX = event.namePositionX ?? 50;
  const nameY = event.namePositionY ?? 30;
  const qrX = event.qrPositionX ?? 50;
  const qrY = event.qrPositionY ?? 60;
  const qrSize = event.qrSize || 150;

  return (
    <div className="min-h-screen bg-stone-900 py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-8">
        
        {/* Core Ticket - aspect-ratio container so % overlays are accurate */}
        <div 
          className="w-full relative shadow-2xl shadow-emerald-900/50 rounded-2xl overflow-hidden"
          ref={ticketRef}
          style={{ width: '100%', maxWidth: '400px', aspectRatio: imageAspectRatio }}
        >
          {bgImage ? (
            <img
              src={bgImage}
              alt="Vé Mời"
              className="absolute inset-0 w-full h-full object-cover block select-none pointer-events-none"
              crossOrigin="anonymous"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-stone-400">
              Chưa có hình nền vé
            </div>
          )}

          {/* Attendee Name overlay */}
          <div 
            className="absolute flex items-center justify-center whitespace-nowrap"
            style={{
              left: `${nameX}%`,
              top: `${nameY}%`,
              transform: 'translate(-50%, -50%)',
              fontFamily: nameFont,
              color: nameColor,
              fontSize: `${nameSize}px`,
              fontWeight: 'bold',
              lineHeight: 1
            }}
          >
            {attendee.name}
          </div>

          {/* QR Code overlay */}
          <div 
            className="absolute flex items-center justify-center bg-white p-2 rounded-xl shadow-lg"
            style={{
              left: `${qrX}%`,
              top: `${qrY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img src={qrBase64} alt="QR Code" style={{ width: `${qrSize}px`, height: `${qrSize}px` }} className="block" />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tạo ảnh vé...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Lưu Thẻ Tham Dự Về Máy
            </>
          )}
        </button>

        <p className="text-stone-400 font-medium text-sm text-center">
          Vui lòng lưu lại thẻ này hoặc chụp ảnh màn hình<br/>để thực hiện check-in tại sự kiện.
        </p>

      </div>
    </div>
  );
}
