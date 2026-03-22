# Event Check-in SaaS - Task Checklist

Dưới đây là checklist các bước phát triển chi tiết, bám sát kiến trúc và chiến lược tối ưu hiệu năng đã đề ra, chia thành 7 giai đoạn.

- [ ] **Phase 1: Setup Môi Trường & Cấu Trúc Dữ Liệu**
  - [ ] Khởi tạo NestJS framework cho Backend.
  - [ ] Khởi tạo Next.js 14 (App Router) cho Frontend.
  - [ ] Thiết lập PostgreSQL database.
  - [ ] Cài đặt Prisma ORM và định nghĩa schema (`User`, `Event`, `Attendee`, `EmailLog`).
  - [ ] Chạy Prisma migrations đầu tiên.

- [ ] **Phase 2: Core Backend (Quản Lý Data Sự Kiện)**
  - [ ] Xây dựng `EventModule`: CRUD cơ bản API.
  - [ ] Xây dựng `AttendeeModule`: API tạo khách hàng đơn lẻ.
  - [ ] Viết API xử lý Import Bulk (nhập danh sách lớn) và gán `qrCode` tự động qua chuỗi UUID.

- [ ] **Phase 3: QR Code & Check-in Logic Engine**
  - [ ] Xây dựng thuật toán tạo liên kết check-in (vd: domain.com/api/checkin?code=123).
  - [ ] Viết `CheckinModule` và API `POST /checkin`.
  - [ ] Bổ sung tầng Validate logic (Không tồn tại, Đã check-in rồi, Thành công).

- [ ] **Phase 4: Giao Diện Quản Trị Cấp Cao (Next.js Dashboard)**
  - [ ] Setup TailwindCSS & Shadcn UI architecture, Side Navigation.
  - [ ] Build trang Danh Sách Sự Kiện (`app/events`).
  - [ ] Build trang Phân Tích Thông Tin Sự Kiện (`app/events/[id]`).
  - [ ] **🔥 Tối Ưu Hóa**: Tích hợp `react-hook-form` + `zod` cho hệ thống nhập liệu đa tầng (array form).
  - [ ] **🔥 Tối Ưu Hóa**: Xây dựng UI Danh Sách Khách Hàng ảo hóa (Virtualization bằng `@tanstack/react-virtual`) tải mượt 5,000 khách.
  - [ ] Tích hợp React Server Actions + `useTransition` cho quy trình submit data tốc độ cao.

- [ ] **Phase 5: Thiết Bị Quét Đầu Cuối (PWA Scanner Apps)**
  - [ ] Cấu hình Next.js thành PWA để chạy mượt trên Điện thoại/Tablet như app nguyên bản.
  - [ ] Code giao diện Camera Scanner (`app/scan`) sử dụng thư viện xử lý ảnh tốc độ cao (html5-qrcode).
  - [ ] Xử lý logic scan -> Call API tự động -> Render màn hình overlays Siêu To (Xanh/Đỏ) báo kết quả trong 2s.

- [ ] **Phase 6: Hệ Thống Gửi Vé Tự Động (Async Emaling)**
  - [ ] Khởi tạo Docker Container cho Redis.
  - [ ] Tích hợp BullMQ vào hệ thống NestJS.
  - [ ] Viết Email Processor Worker để fetch HTML logic và gửi Ticket qua mạng (NodeMailer).
  - [ ] API Trigger quá trình đẩy hàng nghìn khách hàng vào Queue gửi thẻ.

- [ ] **Phase 7: Realtime & Automation Logic**
  - [ ] Cấu hình Socket.io / WebSocket Gateway ở Backend.
  - [ ] Dispatch event socket ngay khi có mã QR được quét thành công.
  - [ ] Bắt event phía Next.js Dashboard để thay đổi con số trên biểu đồ Realtime (Live Metrics) mà không cần tải lại web.
