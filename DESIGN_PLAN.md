# Kế hoạch Thiết kế Ứng dụng EventCheck

## 1. Mục tiêu Thiết kế
Xây dựng một nền tảng quản lý sự kiện SaaS hiện đại, dễ sử dụng, tập trung vào trải nghiệm người dùng (UX) trên cả máy tính và thiết bị di động.

## 2. Phong cách Thiết kế (Visual Direction)
- **Mood:** Chuyên nghiệp, Tin cậy, Công nghệ, Sạch sẽ.
- **Màu sắc chủ đạo:** 
  - Emerald (Xanh ngọc): Đại diện cho sự thành công, tăng trưởng và check-in thành công.
  - Stone (Xám đá): Tạo cảm giác vững chãi, hiện đại và trung tính.
- **Typography:** 
  - **Inter:** Font chữ không chân (sans-serif) hiện đại, dễ đọc cho giao diện quản trị.
  - **Playfair Display:** (Tùy chọn) Cho các tiêu đề lớn hoặc thiết kế vé để tạo sự sang trọng.

## 3. Kiến trúc Thông tin (Information Architecture)
- **Landing Page:** Giới thiệu tính năng, bảng giá và nút đăng ký.
- **Dashboard:** Tổng quan số liệu (số lượng khách, tỷ lệ check-in, biểu đồ thời gian thực).
- **Attendee Management:** Danh sách khách mời, lọc, tìm kiếm, nhập/xuất dữ liệu.
- **Ticket Designer:** Công cụ kéo thả hoặc tùy chỉnh thông số để thiết kế vé QR.
- **Session Management:** Quản lý các phiên thảo luận nhỏ trong sự kiện lớn.
- **Check-in Interface:** Giao diện tối giản cho nhân viên soát vé (hỗ trợ quét QR).
- **Kiosk Mode:** Giao diện tự phục vụ cho khách tự check-in.

## 4. Chiến lược Mobile-First
- **Navigation:** Sử dụng Hamburger menu hoặc Bottom bar để tiết kiệm không gian.
- **Touch Targets:** Các nút bấm tối thiểu 44x44px để dễ dàng thao tác bằng tay.
- **Responsive Grids:** Tự động chuyển đổi từ layout nhiều cột sang 1 cột trên điện thoại.
- **Performance:** Tối ưu hóa kích thước ảnh và QR code để tải nhanh trên mạng di động.

## 5. Các Tính năng Nâng cao (Future Roadmap)
- **Real-time Notifications:** Thông báo qua Telegram/Zalo khi khách VIP check-in.
- **Offline Mode:** Hỗ trợ check-in khi mất kết nối internet và đồng bộ sau.
- **Multi-event Management:** Quản lý nhiều sự kiện cùng lúc cho các đơn vị tổ chức chuyên nghiệp.
- **AI Analytics:** Dự đoán lưu lượng khách dựa trên dữ liệu lịch sử.

---
*Bản kế hoạch này sẽ được cập nhật liên tục dựa trên phản hồi của người dùng.*
