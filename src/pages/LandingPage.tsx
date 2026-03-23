import React, { useState } from 'react';
import { QrCode, CheckCircle2, Users, Mail, ShieldCheck, ArrowRight, Sparkles, Zap, Smartphone, LayoutDashboard, MessageCircle, BarChart, Clock, Star, ChevronRight, Menu, X as CloseIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

const DASHBOARD_IMG = 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?q=80&w=1480&auto=format&fit=crop';
const CHECKIN_IMG = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1480&auto=format&fit=crop';
const QR_IMG = 'https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=800&auto=format&fit=crop';
const CROWD_IMG = 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1480&auto=format&fit=crop';

const stats = [
  { label: 'Sự kiện đã xử lý', value: '2,500+' },
  { label: 'Khách mời đã check-in', value: '500K+' },
  { label: 'Thời gian check-in TB', value: '< 2 giây' },
  { label: 'Khách hàng hài lòng', value: '99.8%' },
];

const features = [
  {
    icon: QrCode,
    color: 'emerald',
    title: 'Check-in QR Code siêu tốc',
    desc: 'Quét mã QR trong chưa tới 2 giây, hỗ trợ hoàn toàn chế độ ngoại tuyến khi mạng chập chờn trong ngày sự kiện.',
    img: QR_IMG,
  },
  {
    icon: Users,
    color: 'blue',
    title: 'Quản lý khách mời toàn diện',
    desc: 'Nhập danh sách hàng loạt từ Excel, phân loại khách VIP, theo dõi trạng thái check-in trực tiếp thời gian thực.',
    img: CHECKIN_IMG,
  },
  {
    icon: Mail,
    color: 'violet',
    title: 'Gửi vé tự động đa kênh',
    desc: 'Phân phối vé QR điện tử qua Email, Zalo ZNS, nhận thông báo VIP tức thì qua Telegram ngay khi có khách quan trọng vào.',
    img: CROWD_IMG,
  },
];

const howItWorks = [
  { step: '01', title: 'Tạo sự kiện', desc: 'Điền thông tin sự kiện, ngày giờ, địa điểm và tùy chỉnh mẫu vé mời theo thương hiệu của bạn.' },
  { step: '02', title: 'Nhập danh sách khách', desc: 'Import từ Excel hoặc thêm từng người. Hệ thống tự động tạo mã QR cá nhân hóa cho mỗi khách mời.' },
  { step: '03', title: 'Gửi vé tự động', desc: 'Một cú nhấn, toàn bộ vé QR được phân phối đến inbox email hoặc Zalo của khách mời.' },
  { step: '04', title: 'Check-in bằng camera', desc: 'Dùng bất kỳ thiết bị nào có camera, hướng vào mã QR, xác nhận trong chưa tới 2 giây.' },
];



const testimonials = [
  { name: 'Nguyễn Thị Lan', role: 'Giám đốc Sự kiện, TechCorp VN', avatar: 'L', text: 'EventCheck giúp chúng tôi check-in 800 khách trong 20 phút đầu. Trước đây làm thủ công mất cả buổi sáng. Tuyệt vời!' },
  { name: 'Trần Văn Minh', role: 'Founder, EventPro Agency', avatar: 'M', text: 'Tính năng gửi vé Zalo ZNS là thứ chúng tôi chờ đợi từ lâu. Tỷ lệ mở vé tăng lên 94% so với chỉ gửi email.' },
  { name: 'Phạm Thu Hà', role: 'Marketing Manager, Startup Hub', avatar: 'H', text: 'Dashboard thời gian thực cực kỳ hữu ích. Ban lãnh đạo nhìn số khách check-in live mà không cần hỏi nhân viên liên tục.' },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number; key?: number }) {
  const Icon = feature.icon;
  const isReversed = index % 2 !== 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-20`}
    >
      <div className="flex-1 space-y-5">
        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${feature.color}-50 text-${feature.color}-700 rounded-full text-sm font-bold border border-${feature.color}-100`}>
          <Icon className="w-4 h-4" />
          Tính năng nổi bật
        </div>
        <h3 className="text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">{feature.title}</h3>
        <p className="text-stone-500 text-lg font-medium leading-relaxed">{feature.desc}</p>
        <Link to="/auth" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
          Dùng thử miễn phí <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex-1 relative">
        <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-[3rem] -z-10" />
        <img src={feature.img} alt={feature.title} className="w-full rounded-[2rem] shadow-2xl object-cover aspect-[4/3]" />
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const user = auth.currentUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-stone-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-stone-900 tracking-tight">EventCheck</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-stone-500 hover:text-emerald-600 transition-colors">Tính năng</a>
            <a href="#how-it-works" className="text-sm font-semibold text-stone-500 hover:text-emerald-600 transition-colors">Quy trình</a>
            <Link to="/checkin/demo" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-4 py-2 rounded-xl">
              <QrCode className="w-4 h-4" /> Quét QR (PG)
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden md:block text-sm font-bold text-stone-600 hover:text-stone-900 transition-colors">Đăng nhập</Link>
                <Link to="/auth" className="hidden md:block px-5 py-2.5 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20">
                  Bắt đầu miễn phí →
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative ml-auto w-[280px] bg-white h-full shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 rounded-xl"><QrCode className="w-5 h-5 text-white" /></div>
                <span className="text-lg font-black text-stone-900">EventCheck</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-stone-700 font-semibold hover:bg-stone-100 transition-colors">Tính năng</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-stone-700 font-semibold hover:bg-stone-100 transition-colors">Quy trình</a>
              <div className="my-2 border-t border-stone-100" />
              <Link
                to="/checkin/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <QrCode className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-sm">Quét QR (PG)</div>
                  <div className="text-xs font-medium text-emerald-600 mt-0.5">Không cần đăng nhập</div>
                </div>
              </Link>
            </nav>
            <div className="mt-auto pt-6 border-t border-stone-100 space-y-3">
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-center block hover:bg-emerald-700 transition-all">
                  Vào Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-bold text-center block hover:bg-stone-800 transition-all">
                    Bắt đầu miễn phí
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 bg-stone-100 text-stone-700 rounded-xl font-bold text-center block hover:bg-stone-200 transition-all">
                    Đăng nhập
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
              <Sparkles className="w-4 h-4" /> Được tin dùng bởi 500+ doanh nghiệp Việt Nam
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl sm:text-6xl md:text-7xl font-black text-stone-900 tracking-tight leading-[1.05]">
              Check-in sự kiện<br />
              <span className="text-emerald-600">chuyên nghiệp & tự động</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-stone-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Gửi vé QR điện tử tốc độ cao, check-in bằng camera trong 2 giây, theo dõi khách mời thời gian thực. Từ 50 đến 50,000 khách — EventCheck xử lý tất cả.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/auth" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2 group">
                Dùng thử miễn phí <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-stone-100 text-stone-800 rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                Xem quy trình
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-6 pt-2 text-sm text-stone-400 font-medium">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Miễn phí vĩnh viễn</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Không cần thẻ tín dụng</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Cài đặt trong 5 phút</span>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-14 relative">
            <div className="absolute -inset-6 bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl rounded-[3rem] -z-10" />
            <img src={CHECKIN_IMG} alt="Nhân viên check-in khách mời bằng QR Code tại sự kiện chuyên nghiệp" className="w-full rounded-[2rem] shadow-2xl border border-stone-200 object-cover max-h-[560px]" />
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-100">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-stone-800">1,248 khách đã check-in</span>
            </div>
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-100">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-stone-800">Thời gian TB: 1.8 giây / khách</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-stone-900 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-emerald-400">{s.value}</div>
              <div className="text-stone-400 font-medium text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Detail */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-28">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
              <Sparkles className="w-4 h-4" /> Tính năng cốt lõi
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight">Mọi thứ bạn cần<br />trong một nền tảng</h2>
          </div>
          {features.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-stone-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-stone-900">Còn rất nhiều tính năng khác</h2>
            <p className="text-stone-500 font-medium">Được thiết kế đặc biệt cho nhà tổ chức sự kiện chuyên nghiệp Việt Nam</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageCircle, title: 'Chatbot AI hỗ trợ', desc: 'Trả lời thắc mắc khách mời về sự kiện 24/7 mà không cần nhân sự.' },
              { icon: BarChart, title: 'Báo cáo phân tích AI', desc: 'Tổng hợp dữ liệu sự kiện, phân tích xu hướng và gửi báo cáo tự động.' },
              { icon: ShieldCheck, title: 'Thiết kế vé thương hiệu', desc: 'Tùy chỉnh mẫu vé điện tử theo màu sắc và logo thương hiệu của bạn.' },
              { icon: Smartphone, title: 'Chế độ Kiosk tự phục vụ', desc: 'Khách mời tự quét vé trên màn hình kiosk, giảm tải nhân sự đón tiếp.' },
              { icon: Zap, title: 'Quản lý phiên (Session)', desc: 'Theo dõi điểm danh từng phòng, từng session trong sự kiện nhiều ngày.' },
              { icon: Star, title: 'Đăng ký vãng lai tại chỗ', desc: 'Đăng ký và check-in ngay lập tức cho khách không đăng ký trước.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white p-7 rounded-3xl border border-stone-200 hover:border-emerald-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-stone-500 text-sm font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" /> Siêu đơn giản
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight">Chạy trong 4 bước</h2>
            <p className="text-stone-500 font-medium">Từ lúc tạo tài khoản đến check-in vị khách đầu tiên, chỉ mất 5 phút.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-16px)] w-8 text-stone-200 z-10">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
                <div className="text-5xl font-black text-emerald-100 mb-4">{step.step}</div>
                <h3 className="text-lg font-black text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-stone-900 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-stone-400 font-medium mt-3">Hơn 500 nhà tổ chức sự kiện đang tin dùng EventCheck mỗi ngày</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                <div className="flex gap-1">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-stone-300 font-medium leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black">{t.avatar}</div>
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-stone-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}


      {/* CTA */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-4xl mx-auto bg-stone-900 rounded-[3rem] p-14 md:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Sẵn sàng tổ chức sự kiện chuyên nghiệp?</h2>
            <p className="text-stone-400 text-lg font-medium">Tham gia miễn phí ngay hôm nay. Không cần thẻ tín dụng.</p>
            <Link to="/auth" className="inline-flex items-center gap-2 px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/20 group">
              Bắt đầu miễn phí ngay <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 border-t border-stone-200 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 rounded-xl"><QrCode className="w-5 h-5 text-white" /></div>
                <span className="text-xl font-black text-stone-900">EventCheck</span>
              </div>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">Nền tảng quản lý sự kiện và check-in thông minh số 1 Việt Nam.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div className="space-y-3">
                <div className="font-black text-stone-900 uppercase tracking-widest text-xs">Sản phẩm</div>
                {['Tính năng', 'Bảng giá', 'Lộ trình phát triển'].map(l => <a key={l} href="#" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">{l}</a>)}
              </div>
              <div className="space-y-3">
                <div className="font-black text-stone-900 uppercase tracking-widest text-xs">Tài nguyên</div>
                {['Hướng dẫn', 'Blog', 'Hỏi đáp'].map(l => <a key={l} href="#" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">{l}</a>)}
              </div>
              <div className="space-y-3">
                <div className="font-black text-stone-900 uppercase tracking-widest text-xs">Liên hệ</div>
                {['Zalo OA', 'Email hỗ trợ', 'Facebook'].map(l => <a key={l} href="#" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">{l}</a>)}
              </div>
            </div>
          </div>
          <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-400 text-sm font-medium">© 2026 EventCheck SaaS. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-6 text-sm text-stone-400">
              <a href="#" className="hover:text-stone-900 font-medium transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-stone-900 font-medium transition-colors">Bảo mật</a>
              <a href="#" className="hover:text-stone-900 font-medium transition-colors">Cookie</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
