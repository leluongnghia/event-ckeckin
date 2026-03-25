import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Target, 
  Map, 
  Layers, 
  Sparkles, 
  Zap, 
  Smartphone, 
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const roadmapData = [
  {
    quarter: 'Quý 2/2026',
    status: 'Đang thực hiện',
    title: 'Nâng cấp Trí tuệ nhân tạo (AI)',
    icon: Sparkles,
    color: 'emerald',
    items: [
      'Tích hợp Chatbot AI hỗ trợ giải đáp khách mời 24/7.',
      'Tự động phân tích và dự báo số lượng khách tham dự dựa trên dữ liệu lịch sử.',
      'Nhận diện khuôn mặt (FaceID) để check-in không cần mã QR.'
    ]
  },
  {
    quarter: 'Quý 3/2026',
    status: 'Lập kế hoạch',
    title: 'Mở rộng Hệ sinh thái Sự kiện',
    icon: Layers,
    color: 'blue',
    items: [
      'Hệ thống quản lý đặt chỗ và bán vé trực tuyến (E-ticketing).',
      'Tích hợp cổng thanh toán ZaloPay, VNPay ngay trên biểu mẫu đăng ký.',
      'Ứng dụng di động dành riêng cho Guest (xem lịch trình, bản đồ sự kiện).'
    ]
  },
  {
    quarter: 'Quý 4/2026',
    status: 'Tầm nhìn',
    title: 'Tối ưu hóa Trải nghiệm Người dùng',
    icon: Rocket,
    color: 'violet',
    items: [
      'Chế độ Offline hoàn hảo cho các khu vực vùng sâu vùng xa.',
      'Báo cáo tự động gửi qua Telegram/Zalo ngay sau khi sự kiện kết thúc.',
      'Global Launch: Hỗ trợ đa ngôn ngữ và múi giờ quốc tế.'
    ]
  }
];

export default function RoadmapPage() {
  React.useEffect(() => {
    document.title = "Lộ trình phát triển — EventCheck by AZEvent";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 bg-stone-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20 mb-6"
          >
            <Map className="w-4 h-4" /> Kế hoạch tương lai
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Lộ trình phát triển <br />
            <span className="text-emerald-500">EventCheck by AZEvent</span>
          </h1>
          <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Chúng tôi không ngừng cải tiến để mang lại giải pháp quản lý sự kiện 
            thông minh nhất, hiện đại nhất cho doanh nghiệp Việt Nam.
          </p>
        </div>
      </section>

      {/* Main Roadmap */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          {roadmapData.map((phase, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-12 md:pl-0"
            >
              {/* Vertical line for mobile */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-100 md:hidden" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Quarter Label */}
                <div className="md:w-32 shrink-0">
                  <div className="inline-block px-4 py-2 bg-stone-100 text-stone-900 rounded-xl text-sm font-black whitespace-nowrap">
                    {phase.quarter}
                  </div>
                </div>

                {/* Progress dot */}
                <div className="hidden md:block w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10" />

                {/* Content Card */}
                <div className="flex-1 bg-white border border-stone-200 rounded-[2rem] p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 bg-${phase.color}-50 text-${phase.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                      <phase.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{phase.status}</div>
                      <h3 className="text-2xl font-black text-stone-900">{phase.title}</h3>
                    </div>
                  </div>
                  
                  <ul className="space-y-4">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-stone-600 font-medium leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Suggest feature */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto bg-emerald-600 rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
          <h2 className="text-3xl font-black mb-6 relative z-10 tracking-tight">Bạn muốn có tính năng nào khác?</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto font-medium relative z-10">
            Hãy góp ý cho chúng tôi để EventCheck ngày càng hoàn thiện hơn và phục vụ tốt nhất nhu cầu của bạn.
          </p>
          <div className="relative z-10">
            <a 
              href="https://zalo.me/0912386968" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-emerald-700 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Gửi góp ý ngay <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-stone-400 text-sm font-medium">
        © 2026 AZEvent.vn — Lộ trình phát triển sản phẩm.
      </footer>
    </div>
  );
}
