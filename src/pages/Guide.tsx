import React from 'react';
import { motion } from 'motion/react';
import { 
  QrCode, 
  Users, 
  Mail, 
  Settings, 
  Palette, 
  CheckCircle2, 
  Zap, 
  Smartphone, 
  FileSpreadsheet, 
  MousePointer2, 
  ChevronRight,
  ShieldCheck,
  Send,
  BarChart
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const guideSteps = [
  {
    id: 'step1',
    icon: Settings,
    title: '1. Tạo và Thiết lập Sự kiện',
    description: 'Bắt đầu bằng việc tạo một sự kiện mới và cấu hình các thông tin cơ bản.',
    details: [
      'Tại Dashboard, nhấn "Tạo sự kiện mới".',
      'Nhập tên sự kiện, ngày giờ và địa điểm tổ chức.',
      'Tải lên logo sự kiện để tăng tính nhận diện thương hiệu.'
    ]
  },
  {
    id: 'step2',
    icon: Palette,
    title: '2. Thiết kế Vé mời (Kéo & Thả)',
    description: 'Tạo ra những chiếc vé mời chuyên nghiệp theo ý muốn với công nghệ kéo thả trực quan.',
    details: [
      'Vào mục "Thiết kế vé mời", tải lên hình nền thiết kế của bạn (kích thước đề xuất 1080x1920).',
      'Phần mềm tự động nhận diện tỷ lệ ảnh để dàn trang chính xác.',
      'Sử dụng chuột để Kéo - Thả vị trí "Tên khách mời" và "Mã QR" vào chỗ trống trên nền ảnh.',
      'Bạn có thể kéo góc của Mã QR hoặc Tên để thay đổi kích thước to/nhỏ trực tiếp.',
      'Tùy chỉnh Font chữ, màu sắc và cỡ chữ để phù hợp với phong cách thương hiệu.',
      'Nhấn "Lưu thiết kế" để áp dụng cho toàn bộ khách mời ngay lập tức.'
    ]
  },
  {
    id: 'step3',
    icon: FileSpreadsheet,
    title: '3. Quản lý Danh sách Khách mời',
    description: 'Đưa dữ liệu khách mời vào hệ thống một cách nhanh chóng và an toàn.',
    details: [
      'Thêm từng khách mời hoặc nhập hàng loạt từ file Excel (.xlsx).',
      'Hệ thống tự động sinh mã QR định danh duy nhất cho từng khách mời.',
      'Phân loại khách VIP để có chế độ đón tiếp đặc biệt.',
      'Dữ liệu được lưu trữ bảo mật trên môi trường Cloud.'
    ]
  },
  {
    id: 'step4',
    icon: Send,
    title: '4. Chiến dịch gửi Vé & Email',
    description: 'Phát hành vé điện tử đến tận tay khách mời chỉ với một cú click.',
    details: [
      'Cấu hình SMTP Gmail của bạn trong phần "Cài đặt chung" (hạn mức ~500 email/ngày).',
      'Sử dụng tính năng "Gửi email hàng loạt", hệ thống tự động lọc những người chưa nhận vé.',
      'Khách mời nhận được email chứa nút "Tải vé" link trực tiếp đến file ảnh chất lượng cao.',
      'Tính năng này giúp tránh việc email bị rơi vào hòm thư rác do đính kèm file nặng.'
    ]
  },
  {
    id: 'step5',
    icon: Zap,
    title: '5. Thực hiện Check-in tại sự kiện',
    description: 'Quy trình check-in siêu tốc giúp loại bỏ tình trạng ùn tắc tại cổng.',
    details: [
      'Truy cập mục "Quét mã QR", hướng camera vào mã QR của khách mời.',
      'Hệ thống phản hồi xanh (Thành công) hoặc đỏ (Kèm lỗi) trong < 2 giây.',
      'Dữ liệu check-in đồng bộ ngay lập tức lên Dashboard quản lý.',
      'Hỗ trợ chế độ offline: Nếu mất mạng đột ngột, dữ liệu sẽ tự đồng bộ ngay khi có kết nối trở lại.'
    ]
  },
  {
    id: 'step6',
    icon: BarChart,
    title: '6. Phân tích & Báo chuẩn (Sau sự kiện)',
    description: 'Tổng kết sự kiện một cách thông minh bằng báo cáo Excel và AI.',
    details: [
      'Truy cập "Tổng quan" để xem Dashboard tự động cập nhật biểu đồ theo giờ.',
      'Sử dụng tính năng "Phân tích bằng AI" để nhận lời khuyên và dự báo từ Google Gemini.',
      'Nhấn nút "Xuất báo cáo" để tải về file Excel danh sách khách kèm thời gian check-in chính xác.',
      'Báo cáo giúp bạn đối soát ngân sách và đo lường hiệu quả truyền thông cực kỳ nhanh chóng.'
    ]
  }
];

export default function GuidePage() {
  React.useEffect(() => {
    document.title = "Hướng dẫn sử dụng — EventCheck by AZEvent";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-stone-900 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full -z-0" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20 mb-6"
          >
            <ShieldCheck className="w-4 h-4" /> Tài liệu hướng dẫn sử dụng
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6"
          >
            Làm chủ <span className="text-emerald-500">EventCheck</span><br />trong ít phút
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-400 text-lg md:text-xl max-w-3xl mx-auto font-medium"
          >
            Hướng dẫn chi tiết từng bước để bạn tổ chức một sự kiện chuyên nghiệp, 
            tự động hóa quy trình đón tiếp và tạo ấn tượng tốt nhất với khách mời.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-24">
          
          {guideSteps.map((step, idx) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Connector line */}
              {idx < guideSteps.length - 1 && (
                <div className="absolute left-8 top-16 bottom-[-64px] w-0.5 bg-stone-100 group-hover:bg-emerald-100 transition-colors hidden md:block" />
              )}
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="shrink-0">
                  <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-stone-900/20 group-hover:bg-emerald-600 transition-colors group-hover:scale-110 duration-300">
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                      {step.title}
                    </h2>
                    <p className="text-stone-500 font-medium text-lg italic">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="bg-stone-50 rounded-[2rem] p-8 border border-stone-100 group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-all">
                    <ul className="space-y-4">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-4 text-stone-700">
                          <div className="mt-1.5 shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </div>
                          <span className="font-medium leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Firebase Benefits Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 md:p-16 space-y-10"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-full text-sm font-bold border border-emerald-100 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Tại sao chọn Công nghệ Firebase?
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                Công nghệ lõi từ Google <br />
                <span className="text-emerald-600">Sức mạnh bên trong EventCheck</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { 
                  title: 'Đồng bộ Thời gian thực (Real-time)', 
                  desc: 'Khi một khách mời check-in tại cổng, trạng thái trên Dashboard và tất cả các thiết bị khác sẽ được cập nhật ngay lập tức mà không cần tải lại trang.' 
                },
                { 
                  title: 'Hỗ trợ Hoạt động Ngoại tuyến', 
                  desc: 'Công nghệ Firestore cho phép hệ thống vẫn hoạt động ngay cả khi kết nối Internet bị mất đột ngột. Dữ liệu sẽ tự động đẩy lên Cloud ngay khi có mạng trở lại.' 
                },
                { 
                  title: 'Bảo mật & Độ tin cậy cao', 
                  desc: 'Dữ liệu được lưu trữ trên hạ tầng Cloud của Google, đảm bảo an toàn tuyệt đối và tính sẵn sàng cao nhất cho các sự kiện quan trọng.' 
                },
                { 
                  title: 'Tốc độ xử lý ưu việt', 
                  desc: 'Các tác vụ tính toán, sinh mã QR và quản lý tệp tin được tối ưu hóa để phản hồi trong phần nghìn giây, giúp quy trình đón tiếp luôn mượt mà.' 
                }
              ].map((benefit, bIdx) => (
                <div key={bIdx} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
                  <h4 className="font-black text-emerald-700 text-lg">{benefit.title}</h4>
                  <p className="text-stone-500 font-medium text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
          <h2 className="text-3xl md:text-4xl font-black mb-6 relative z-10 tracking-tight">Bạn đã nắm rõ quy trình?</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto font-medium relative z-10">
            Bắt đầu tạo sự kiện đầu tiên của bạn ngay bây giờ và trải nghiệm sự tiện lợi vượt trội.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <motion.a 
              href="/auth"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white text-emerald-700 font-black rounded-2xl shadow-xl flex items-center gap-2"
            >
              Bắt đầu ngay <ChevronRight className="w-5 h-5" />
            </motion.a>
            <motion.a 
              href="/dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-emerald-700/50 text-white font-bold rounded-2xl border border-emerald-500/30 backdrop-blur-sm"
            >
              Vào Dashboard
            </motion.a>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-stone-400 text-sm font-medium leading-relaxed">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-stone-800">EventCheck SaaS</span>
          </div>
          <p className="text-center md:text-left">© 2026 AZEvent.vn — Được phát triển bởi đội ngũ kỹ thuật AZEvent.</p>
          <div className="flex gap-6">
            <a href="https://azevent.vn" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">azevent.vn</a>
            <a href="https://luckydraw.azevent.vn" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">luckydraw.pro</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
