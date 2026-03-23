import React from 'react';
import { QrCode, CheckCircle2, Users, Mail, ShieldCheck, ArrowRight, Sparkles, Zap, Smartphone, LayoutDashboard, MessageCircle, Map, BarChart } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const user = auth.currentUser;

  return (
    <div className="min-h-screen bg-stone-50 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-stone-900 tracking-tight">EventCheck</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-stone-600 hover:text-emerald-600 transition-colors">Tính năng</a>
            <a href="#pricing" className="text-sm font-bold text-stone-600 hover:text-emerald-600 transition-colors">Bảng giá</a>
            {user ? (
              <Link 
                to="/"
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Vào Dashboard
              </Link>
            ) : (
              <Link 
                to="/auth"
                className="px-6 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
              >
                Đăng nhập
              </Link>
            )}
          </div>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="md:hidden p-2 text-stone-600"
          >
            <Zap className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs md:text-sm font-bold border border-emerald-100"
          >
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Giải pháp quản lý sự kiện 4.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black text-stone-900 tracking-tight leading-[1.1] px-2"
          >
            Check-in sự kiện <br />
            <span className="text-emerald-600">Nhanh hơn, Thông minh hơn</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base md:text-xl text-stone-500 font-medium leading-relaxed px-4"
          >
            Tự động hóa quy trình check-in bằng QR Code, quản lý khách mời thời gian thực và phân tích dữ liệu bằng AI. Tất cả trong một nền tảng duy nhất.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4 px-4"
          >
            {user ? (
              <Link 
                to="/"
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-2 group"
              >
                Quay lại Dashboard
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link 
                to="/auth"
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-2 group"
              >
                Bắt đầu miễn phí
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            {!user && (
              <Link 
                to="/auth"
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-stone-900 border border-stone-200 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-stone-50 transition-all shadow-sm flex items-center justify-center"
              >
                Xem bản Demo
              </Link>
            )}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 md:mt-20 relative max-w-5xl mx-auto px-2"
          >
            <div className="absolute -inset-2 md:-inset-4 bg-emerald-500/10 blur-2xl md:blur-3xl rounded-[2rem] md:rounded-[3rem] -z-10" />
            <img 
              src="https://picsum.photos/seed/dashboard/1200/800" 
              alt="Dashboard Preview" 
              className="rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-stone-200 w-full object-cover aspect-video"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white border-y border-stone-200 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight">Tính năng vượt trội</h2>
            <p className="text-stone-500 font-medium">Mọi thứ bạn cần để tổ chức một sự kiện thành công rực rỡ</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: QrCode, title: 'Check-in QR Code', desc: 'Quét mã QR siêu tốc, hỗ trợ cả chế độ ngoại tuyến khi mất mạng.' },
              { icon: Users, title: 'Quản lý Khách mời', desc: 'Dễ dàng nhập danh sách, phân loại khách VIP và theo dõi trạng thái.' },
              { icon: Mail, title: 'Thông báo Đa kênh', desc: 'Gửi vé mời qua Email, Zalo ZNS và thông báo VIP qua Telegram.' },
              { icon: MessageCircle, title: 'Trợ lý Chatbot AI', desc: 'Hỗ trợ giải đáp thắc mắc về sự kiện 24/7 với AI thông minh.' },
              { icon: Map, title: 'Tích hợp Bản đồ', desc: 'Tìm kiếm địa điểm thú vị gần sự kiện với Google Maps Grounding.' },
              { icon: BarChart, title: 'Khảo sát Tự động', desc: 'Thu thập phản hồi khách mời và phân tích cảm xúc bằng AI.' },
              { icon: ShieldCheck, title: 'Bảo mật & Phân tích', desc: 'Dữ liệu được mã hóa an toàn và báo cáo sự kiện thời gian thực.' },
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-stone-50 rounded-[2rem] border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-stone-900 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
          
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight relative z-10">
            Sẵn sàng nâng tầm <br /> sự kiện của bạn?
          </h2>
          <p className="text-stone-400 text-lg md:text-xl font-medium max-w-2xl mx-auto relative z-10">
            Tham gia cùng hàng ngàn nhà tổ chức sự kiện chuyên nghiệp ngay hôm nay.
          </p>
          <div className="pt-4 relative z-10">
            {user ? (
              <Link 
                to="/"
                className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/20"
              >
                Vào Dashboard ngay
              </Link>
            ) : (
              <Link 
                to="/auth"
                className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/20"
              >
                Bắt đầu ngay bây giờ
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-200 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-black text-stone-900 tracking-tight">EventCheck</span>
          </div>
          <p className="text-stone-400 text-sm font-medium">© 2026 EventCheck SaaS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><Zap className="w-5 h-5" /></a>
            <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><Smartphone className="w-5 h-5" /></a>
            <a href="#" className="text-stone-400 hover:text-stone-900 transition-colors"><ShieldCheck className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
