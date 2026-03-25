import React from 'react';
import { QrCode, CheckCircle2, Users, Mail, ShieldCheck, ArrowRight, Sparkles, Zap, Smartphone, LayoutDashboard, MessageCircle, BarChart, Clock, Star, ChevronRight, Menu, X as CloseIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

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
  { step: '01', title: 'Tạo sự kiện', desc: 'Điền thông tin sự kiện, ngày giờ, địa điểm và tùy chỉnh mẫu vé mời theo thương hiệu.' },
  { step: '02', title: 'Nhập khách mời', desc: 'Import từ Excel. Hệ thống tự động sinh mã QR định danh duy nhất cho từng khách.' },
  { step: '03', title: 'Gửi vé tự động', desc: 'Phân phối vé qua Email/Zalo. Khách nhận được vé QR để quét tại sự kiện.' },
  { step: '04', title: 'Quét mã Check-in', desc: 'Dùng camera điện thoại hoặc máy tính để quét mã QR. Xác nhận trong 2 giây.' },
  { step: '05', title: 'Báo cáo & AI', desc: 'Xuất báo cáo Excel và sử dụng AI để phân tích hiệu quả sự kiện ngay lập tức.' },
];

const testimonials = [
  { name: 'Nguyễn Thị Lan', role: 'Giám đốc Sự kiện, TechCorp VN', avatar: 'L', text: 'EventCheck giúp chúng tôi check-in 800 khách trong 20 phút đầu. Trước đây làm thủ công mất cả buổi sáng. Tuyệt vời!' },
  { name: 'Trần Văn Minh', role: 'Founder, EventPro Agency', avatar: 'M', text: 'Tính năng gửi vé Zalo ZNS là thứ chúng tôi chờ đợi từ lâu. Tỷ lệ mở vé tăng lên 94% so với chỉ gửi email.' },
  { name: 'Phạm Thu Hà', role: 'Marketing Manager, Startup Hub', avatar: 'H', text: 'Dashboard thời gian thực cực kỳ hữu ích. Ban lãnh đạo nhìn số khách check-in live mà không cần hỏi nhân viên liên tục.' },
];

function FeatureCard({ feature, index }: { feature: any; index: number }) {
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
        <img src={feature.img} alt={`${feature.title} - Giải pháp EventCheck by AZEvent`} className="w-full rounded-[2rem] shadow-2xl object-cover aspect-[4/3] border-4 border-white" />
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  React.useEffect(() => {
    document.title = "EventCheck by AZEvent - Giải pháp Check-in & Quản lý Sự kiện 4.0";
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <PublicNavbar />

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
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Miễn phí cho 50 khách đầu</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Không cần thẻ tín dụng</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cài đặt trong 5 phút</span>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-14 relative">
            <div className="absolute -inset-6 bg-gradient-to-b from-emerald-500/10 to-transparent blur-3xl rounded-[3rem] -z-10" />
            <img 
              src={CHECKIN_IMG} 
              alt="Nhân viên check-in khách mời bằng QR Code tại sự kiện của AZEvent" 
              className="w-full rounded-[2rem] shadow-2xl border border-stone-200 object-cover max-h-[560px]" 
            />
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

      {/* Firebase Technology Section (Công nghệ lõi) */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" /> Tại sao chọn Công nghệ Firebase?
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight"
            >
              Công nghệ lõi từ Google <br />
              <span className="text-emerald-600">Sức mạnh bên trong EventCheck</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Đồng bộ Real-time', 
                desc: 'Mọi dữ liệu check-in được cập nhật ngay lập tức trên tất cả thiết bị của ban tổ chức.',
                icon: Zap 
              },
              { 
                title: 'Hoạt động Offline', 
                desc: 'Tự động đồng bộ lại ngay khi có mạng trở lại, đảm bảo quy trình không bao giờ gián đoạn.',
                icon: Smartphone 
              },
              { 
                title: 'Bảo mật Tuyệt đối', 
                desc: 'Dữ liệu được bảo vệ bởi hạ tầng Cloud của Google, cam kết an toàn thông tin khách mời.',
                icon: ShieldCheck 
              },
              { 
                title: 'Tốc độ Phản hồi', 
                desc: 'Phản lục quét QR trong phần nghìn giây, loại bỏ hoàn toàn việc xếp hàng chờ đợi.',
                icon: Clock 
              }
            ].map((benefit, bIdx) => (
              <motion.div 
                key={bIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: bIdx * 0.1 }}
                className="bg-stone-50 p-8 rounded-3xl border border-stone-100 hover:border-emerald-300 transition-all group shadow-sm hover:bg-white"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 shadow-sm transition-transform">
                  <benefit.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-black text-stone-900 text-lg mb-3 tracking-tight">{benefit.title}</h4>
                <p className="text-stone-500 font-medium text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
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
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight">Chạy trong 5 bước</h2>
            <p className="text-stone-500 font-medium">Từ lúc tạo tài khoản đến check-in vị khách đầu tiên, chỉ mất 5 phút.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
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

      {/* AZEvent Developer Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-stone-50 border border-stone-200 rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
                  <Sparkles className="w-4 h-4" />
                  Được phát triển bởi
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-xl"><Zap className="w-5 h-5 text-white" /></div>
                  <span className="text-2xl font-black text-stone-900">AZEVENT.VN</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                  10 năm kinh nghiệm,<br />
                  <span className="text-emerald-600">hàng trăm sự kiện thành công</span>
                </h2>
                <p className="text-stone-500 font-medium leading-relaxed text-lg">
                  AzEvent là đơn vị tổ chức sự kiện chuyên nghiệp hàng đầu Việt Nam với hơn 10 năm kinh nghiệm
                  trong lĩnh vực tổ chức Gala Dinner, Tất Niên, Hội nghị và các sự kiện doanh nghiệp quy mô lớn.
                  EventCheck được xây dựng từ chính nhu cầu thực tế của hàng trăm sự kiện đã tổ chức — giúp việc check-in trở nên
                  chuyên nghiệp, minh bạch và ấn tượng hơn trước hàng nghìn khách mời.
                </p>
                <a href="https://azevent.vn" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
                  Xem hồ sơ năng lực <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-5 shrink-0 w-full lg:w-auto">
                {[
                  { value: '10+', label: 'Năm kinh nghiệm' },
                  { value: '500+', label: 'Sự kiện Gala, Tất Niên' },
                  { value: '50K+', label: 'Khách mời đã phục vụ' },
                  { value: '24/7', label: 'Hỗ trợ khách hàng' },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 text-center shadow-sm">
                    <div className="text-3xl font-black text-emerald-600">{s.value}</div>
                    <div className="text-stone-500 text-sm font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


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
      <footer className="py-14 border-t border-stone-200 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 rounded-xl"><QrCode className="w-5 h-5 text-white" /></div>
                <span className="text-xl font-black text-stone-900">EventCheck</span>
              </div>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">Nền tảng quản lý sự kiện và check-in thông minh — phát triển bởi AZEvent.vn.</p>
              <div className="pt-2 space-y-1.5 text-sm text-stone-500">
                <p className="font-semibold text-stone-700">Công ty TNHH TT & Tổ chức Sự kiện Số 1</p>
                <p>📍 Sảnh D, T02, Chung cư C37 Bắc Hà, 17 Tố Hữu, Nam Từ Liêm, Hà Nội</p>
                <p>📞 <a href="tel:0912386968" className="hover:text-emerald-600 transition-colors font-bold">09123.86.968</a></p>
                <p>✉️ <a href="mailto:info@azevent.vn" className="hover:text-emerald-600 transition-colors">info@azevent.vn</a></p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div className="space-y-3">
                <div className="font-black text-stone-900 uppercase tracking-widest text-xs">Sản phẩm</div>
                <a href="#features" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">Tính năng</a>
                <Link to="/roadmap" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">Lộ trình phát triển</Link>
                <Link to="/guide" className="block text-emerald-600 hover:text-emerald-700 font-bold transition-colors">Hướng dẫn sử dụng</Link>
              </div>
              <div className="space-y-3">
                <div className="font-black text-stone-900 uppercase tracking-widest text-xs">Sản phẩm khác</div>
                <a href="https://luckydraw.azevent.vn" target="_blank" rel="noreferrer" className="block text-stone-500 hover:text-emerald-600 font-medium transition-colors">LuckyDraw Pro</a>
                <a href="https://azevent.vn" target="_blank" rel="noreferrer" className="block text-stone-500 hover:text-emerald-600 font-medium transition-colors">AZEvent.vn</a>
              </div>
              <div className="space-y-3">
                <div className="font-black text-stone-900 uppercase tracking-widest text-xs">Liên hệ</div>
                <a href="https://zalo.me/0912386968" target="_blank" rel="noreferrer" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">Zalo: 09123.86.968</a>
                <a href="mailto:info@azevent.vn" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">info@azevent.vn</a>
                <a href="https://facebook.com/azevent.vn" target="_blank" rel="noreferrer" className="block text-stone-500 hover:text-stone-900 font-medium transition-colors">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-400 text-sm font-medium">© 2026 AZEvent.vn — EventCheck SaaS. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-6 text-sm text-stone-400">
              <Link to="/terms" className="hover:text-stone-900 font-medium transition-colors">Điều khoản</Link>
              <Link to="/privacy" className="hover:text-stone-900 font-medium transition-colors">Bảo mật</Link>
              <a href="https://azevent.vn" target="_blank" rel="noreferrer" className="hover:text-emerald-600 font-medium transition-colors">azevent.vn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
