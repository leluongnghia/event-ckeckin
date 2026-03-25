import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Eye, 
  Lock, 
  Share2, 
  Bell,
  CheckCircle2,
  LockKeyhole,
  Smartphone,
  Info,
  Clock
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const privacyData = [
  {
    icon: Eye,
    title: '1. Dữ liệu chúng tôi thu thập',
    content: [
      'Thông tin cá nhân: Tên, email và số điện thoại của nhà tổ chức sự kiện.',
      'Dữ liệu khách mời: Chúng tôi lưu trữ tạm thời dựa trên file Excel của bạn tải lên.',
      'Dữ liệu check-in: Thời gian quét mã QR, thiết bị quét và trạng thái vào cửa.',
      'Cookie: Dùng để duy trì phiên đăng nhập và ghi nhớ lựa chọn giao diện.'
    ]
  },
  {
    icon: Lock,
    title: '2. Cách thức Bảo vệ Dữ liệu',
    content: [
      'Toàn bộ dữ liệu được lưu trữ trên Google Cloud Platform với hạ tầng an mật nhất thế giới.',
      'Hệ mã hóa SSL 256-bit trong quá trình truyền tải dữ liệu.',
      'Phân quyền truy cập theo từng tài khoản, không chia sẻ data giữa các sự kiện khác nhau.'
    ]
  },
  {
    icon: Share2,
    title: '3. Quyền Chia sẻ Dữ liệu',
    content: [
      'Chúng tôi cam kết KHÔNG bán, KHÔNG cho thuê dữ liệu khách mời của bạn cho bất kỳ bên thứ ba nào.',
      'Thông tin chỉ được chia sẻ theo yêu cầu pháp lý từ cơ quan chức năng (nếu có).',
      'Bạn có quyền xóa sạch hoàn toàn dữ liệu về một sự kiện bất kỳ lúc nào.'
    ]
  },
  {
    icon: Bell,
    title: '4. Quyền của Bạn khi sử dụng',
    content: [
      'Bạn có quyền yêu cầu trích xuất toàn bộ dữ liệu ra file Excel bất kỳ lúc nào.',
      'Bạn có thể cập nhật thông tin cài đặt hòm thư SMTP riêng để đảm bảo tính riêng tư toàn vẹn nhất.',
      'Bạn được thông báo ngay lập tức nếu có bất kỳ thay đổi nào liên quan đến bảo mật.'
    ]
  }
];

export default function PrivacyPage() {
  React.useEffect(() => {
    document.title = "Chính sách Bảo mật — EventCheck by AZEvent";
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PublicNavbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest"
          >
            <LockKeyhole className="w-4 h-4" /> Bảo mật là ưu tiên hàng đầu
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Chính sách <span className="text-emerald-600">Bảo mật thông tin</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto font-medium">
            Cam kết bảo vệ dữ liệu khách mời và quyền riêng tư của khách hàng trong suốt quá trình sử dụng hệ thống.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {privacyData.map((phase, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col md:flex-row gap-8 items-start md:items-center"
            >
              <div className="shrink-0 w-16 h-16 bg-white border border-stone-200 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                <phase.icon className="w-8 h-8" />
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">{phase.title}</h2>
                <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:border-emerald-200 group transition-all">
                  <ul className="space-y-4">
                    {phase.content.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                        <span className="text-stone-600 font-medium leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Special Note Box */}
          <div className="bg-stone-900 rounded-[3rem] p-10 md:p-16 text-white space-y-8 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                <Info className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight">Lưu ý về Dữ liệu Khách mời</h2>
            </div>
            <p className="text-stone-400 text-lg font-medium leading-relaxed max-w-3xl">
              Chúng tôi hiểu rằng dữ liệu khách mời là tài sản quý giá nhất của bạn. EventCheck KHÔNG TỰ Ý 
              sử dụng dữ liệu này cho các mục đích tiếp thị hoặc chia sẻ dữ liệu ra bên ngoài. Bạn hoàn toàn làm chủ dữ liệu của mình.
            </p>
            <div className="flex items-center gap-6 pt-2 text-stone-500 text-sm">
              <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Bảo mật 256-bit</div>
              <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Bảo vệ truy cập</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Hoạt động 24/7</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-stone-400 text-sm font-medium">
        © 2026 EventCheck by AZEvent. Chính sách bảo vệ quyền lợi người dùng Việt.
      </footer>
    </div>
  );
}
