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
  Send
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
    description: 'Đây là tính năng độc đáo giúp bạn tạo ra những chiếc vé mời chuyên nghiệp theo ý muốn.',
    details: [
      'Vào mục "Thiết kế vé", tải lên hình nền thiết kế của bạn (kích thước đề xuất 1080x1920).',
      'Sử dụng chuột để Kéo - Thả vị trí "Tên khách mời" và "Mã QR" vào chỗ trống trên ảnh nền.',
      'Tùy chỉnh Font chữ, màu sắc và cỡ chữ để phù hợp với phong cách thương hiệu.',
      'Nhấn "Lưu thiết kế" để áp dụng cho toàn bộ khách mời.'
    ]
  },
  {
    id: 'step3',
    icon: FileSpreadsheet,
    title: '3. Quản lý Danh sách Khách mời',
    description: 'Đưa dữ liệu khách mời vào hệ thống một cách nhanh chóng.',
    details: [
      'Bạn có thể thêm từng khách mời hoặc nhập hàng loạt từ file Excel (.xlsx).',
      'Hệ thống tự động sinh mã QR định danh duy nhất cho từng khách mời.',
      'Phân loại khách VIP để có chế độ đón tiếp đặc biệt.'
    ]
  },
  {
    id: 'step4',
    icon: Send,
    title: '4. Chiến dịch gửi Vé & Email',
    description: 'Phát hành vé điện tử đến tận tay khách mời chỉ với một cú click.',
    details: [
      'Cấu hình hòm thư gửi đi (SMTP) trong phần Cài đặt nếu bạn muốn dùng email thương hiệu riêng.',
      'Sử dụng tính năng "Gửi email hàng loạt", hệ thống sẽ tự động lọc những người chưa nhận vé.',
      'Khách mời sẽ nhận được email chứa vé mời kèm mã QR và hướng dẫn check-in.'
    ]
  },
  {
    id: 'step5',
    icon: Zap,
    title: '5. Thực hiện Check-in tại sự kiện',
    description: 'Quy trình check-in siêu tốc giúp loại bỏ tình trạng ùn tắc tại cổng.',
    details: [
      'Sử dụng máy tính bảng, điện thoại hoặc máy quét có kết nối internet.',
      'Truy cập mục "Quét mã QR", hướng camera vào mã QR của khách mời.',
      'Màn hình hiện xanh và thông báo "Thành công" trong < 2 giây.',
      'Theo dõi số lượng khách đang vào trực tiếp trên bảng điều khiển.'
    ]
  }
];

export default function GuidePage() {
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

      <footer className="py-12 border-t border-stone-100 text-center text-stone-400 text-sm font-medium">
        © 2026 EventCheck SaaS. Tài liệu dành cho người dùng.
      </footer>
    </div>
  );
}
