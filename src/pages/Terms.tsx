import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Briefcase,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const sectionData = [
  {
    icon: FileText,
    title: '1. Điều khoản Chung',
    content: [
      'Bằng việc truy cập và sử dụng EventCheck, bạn đồng ý với các Điều khoản & Điều kiện do AZEvent cung cấp.',
      'Chúng tôi có quyền thay đổi thông tin điều khoản và sẽ thông báo trước 30 ngày cho các thay đổi lớn.',
      'Sản phẩm nhắm đến đối tượng người dùng là cá nhân, công ty, tổ chức sự kiện chuyên nghiệp Việt Nam.'
    ]
  },
  {
    icon: ShieldCheck,
    title: '2. Quyền và Nghĩa vụ Người dùng',
    content: [
      'Cung cấp thông tin sự kiện và danh sách khách mời chính xác, hợp pháp.',
      'Bảo mật thông tin tài khoản đăng nhập để tránh rò rỉ dữ liệu sự kiện.',
      'Sử dụng hệ thống đúng mục đích, không thực hiện hành vi tấn công hay phá hoại hạ tầng.'
    ]
  },
  {
    icon: Briefcase,
    title: '3. Sở hữu Trí tuệ',
    content: [
      'Nền tảng EventCheck, bao gồm mã nguồn, thiết kế và logo thuộc sở hữu của AZEvent.vn.',
      'Bạn có quyền sở hữu dữ liệu khách mời và sự kiện của chính mình đã tải lên hệ thống.',
      'Không được sao chép mẫu vé mời hay giao diện phần mềm cho mục đích thương mại hóa riêng.'
    ]
  },
  {
    icon: HelpCircle,
    title: '4. Giới hạn Trách nhiệm',
    content: [
      'Chúng tôi không chịu trách nhiệm trong các trường hợp sự cố mạng diện rộng, lỗi từ nhà cung cấp internet.',
      'Dữ liệu khách mời được Google Cloud bảo vệ, tuy nhiên bạn cần có kế hoạch dự phòng (backup) file Excel.',
      'AZEvent không can thiệp vào quy trình đón tiếp thực tế tại sự kiện của bạn.'
    ]
  }
];

export default function TermsPage() {
  React.useEffect(() => {
    document.title = "Điều khoản sử dụng — EventCheck by AZEvent";
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <PublicNavbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest"
          >
            <Clock className="w-4 h-4" /> Cập nhật lần cuối: Tháng 3/2026
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            Điều khoản <span className="text-emerald-600">Sử dụng dịch vụ</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-2xl mx-auto font-medium">
            Tất cả các quy tắc và thỏa thuận để đảm bảo quyền lợi của bạn khi sử dụng giải pháp EventCheck.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {sectionData.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-stone-200 shadow-sm space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <section.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-stone-900 tracking-tight">{section.title}</h2>
              </div>
              
              <ul className="space-y-4">
                {section.content.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                    <span className="text-stone-600 font-medium leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          
          {/* Footer of Content */}
          <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white text-center space-y-6">
            <h3 className="text-2xl font-black">Bạn có thắc mắc về điều khoản?</h3>
            <p className="text-emerald-100 font-medium max-w-xl mx-auto">
              Đừng ngần ngại liên hệ với chuyên viên hỗ trợ của AZEvent để được giải đáp thấu đáo nhất.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <a 
                href="mailto:info@azevent.vn" 
                className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl hover:scale-105 transition-transform"
              >
                Gửi Email
              </a>
              <a 
                href="https://azevent.vn" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-emerald-700/50 text-white font-bold rounded-2xl hover:scale-105 transition-transform border border-emerald-500/30 flex items-center gap-2"
              >
                AZEvent.vn <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-stone-400 text-sm font-medium">
        © 2026 EventCheck by AZEvent. Giữ quyền thay đổi thông tin.
      </footer>
    </div>
  );
}
