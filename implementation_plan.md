# Kế Hoạch Triển Khai: Hệ Thống Event Check-in SaaS

Bản kế hoạch này tổng hợp toàn bộ kiến trúc hệ thống, chiến lược tối ưu hóa hiệu năng phía Frontend, và hệ thống Prompt từng bước để cung cấp cho Google AI Studio (hoặc các AI LLM khác) nhằm sinh code chuẩn xác theo từng phase.

## Tổng Quan Kiến Trúc (Architecture)

*   **Frontend**: Next.js 14+ (App Router), TailwindCSS, Shadcn UI.
*   **Backend**: NestJS, Prisma ORM.
*   **Database**: PostgreSQL.
*   **Queue/Background Jobs**: Redis + BullMQ (dùng cho hệ thống gởi email hàng loạt).
*   **Thời gian thực**: Socket.io / WebSockets (cho live dashboard).

## Chiến Lược Tối Ưu Hiệu Năng Form & Dữ Liệu Lớn
Giải pháp xử lý mượt mà khi người dùng thao tác với lượng data khổng lồ (ví dụ nhập 1000 khách hàng cùng lúc):

1.  **Quản lý Form State siêu tốc**: Sử dụng `react-hook-form` (Uncontrolled Components) kết hợp `zod` để validate. Ngăn chặn re-render toàn bộ DOM.
2.  **Cửa Sổ Ảo (Virtualization)**: Sử dụng `@tanstack/react-virtual` để chỉ render các hàng dữ liệu (inputs) đang hiển thị trên màn hình, giữ DOM thật nhẹ.
3.  **Next.js Server Actions & `useTransition`**: Gom khối dữ liệu khổng lồ đẩy xuống Server Actions xử lý ngầm, bọc trong React 18 `startTransition` để UI không bao giờ bị freeze (đóng băng).
4.  **Optimistic Updates**: Khi lưu dữ liệu, giả lập thành công trên UI trước để tạo cảm giác realtime (0ms delay), đồng thời debounce lưu nháp (auto-save) chạy ngầm phía sau (`zustand`).

---

## Các Phase Phát Triển & Master Prompts cho Google AI Studio

Dưới đây là các câu lệnh (Prompt) chuẩn để bạn trực tiếp đưa vào AI cho từng module, đảm bảo mô hình sinh ra code sạch, không bị quá tải.

### Phase 1: Setup Cơ Bản & Database Schema
**Mục tiêu:** Khởi tạo cấu trúc dự án và Database chuẩn mực.
```text
I am building a high-performance SaaS event check-in system. 
Tech Stack: NestJS backend, Next.js frontend, PostgreSQL, Prisma ORM.

Task 1: Generate the exact `schema.prisma` file containing the following models, including their relationships:
- User (id, email, password, role: ADMIN | STAFF)
- Event (id, name, description, startTime, endTime, location, userId)
- Attendee (id, eventId, name, email, phone, company, qrCode [unique], checkedIn [boolean], checkInTime)
- EmailLog (id, attendeeId, status, sentAt)

Ensure proper relational constraints. Print the Prisma schema and the commands to initialize NestJS, Prisma migrate, and Next.js.
```

### Phase 2: Core Backend - Event & Attendee API
**Mục tiêu:** Xử lý CRUD căn bản trên server.
```text
Context: We have the Prisma schema for Event and Attendee.
Task 2: Build the `EventModule` and `AttendeeModule` in NestJS.
1. EventModule: CRUD endpoints for Events.
2. AttendeeModule: CRUD endpoints, PLUS a robust bulk import endpoint `POST /attendees/import` that accepts a massive JSON array of attendees.
3. Use the `uuid` package to automatically generate a unique `qrCode` for each new attendee.
Output the Controller and Service files with clean architecture and error handling.
```

### Phase 3: QR Code & The Check-in Engine
**Mục tiêu:** Trái tim của hệ thống quét mã.
```text
Context: We have the Attendee database.
Task 3: Build a robust `CheckinModule` in NestJS.
1. Create `POST /checkin` accepting `{ "code": "uuid_string" }`.
2. Logic:
   - Find attendee by `qrCode`. If not found -> throw HTTP 404.
   - If `checkedIn` is true -> throw HTTP 400 "Already checked in".
   - If valid -> update `checkedIn` to true and `checkInTime` to now(). Return attendee data.
Output `checkin.controller.ts` and `checkin.service.ts`.
```

### Phase 4: Frontend Quản Trị Hệ Thống (Next.js Dashboard)
**Mục tiêu:** Giao diện cho Admin tạo sự kiện và xem danh sách khách mời với hiệu năng cao.
```text
Context: Building the Admin Dashboard using Next.js 14 App Router, Tailwind, and lucide-react.
Task 4: Create the Event & Attendee Management UI.
1. Create a dynamic layout `app/events/[id]/page.tsx`.
2. Crucial: The Attendee table must handle potentially 1000+ rows. Use `@tanstack/react-virtual` to virtualize the list. 
3. Include a complex bulk addition form using `react-hook-form` and `zod` utilizing `useFieldArray` to ensure uncompromised rendering speed when modifying large inputs.
Provide the production-ready React component code.
```

### Phase 5: PWA App Quét QR cho Lễ Tân (Scanner App)
**Mục tiêu:** Giao diện mobile-friendly cho thiết bị quét tại cổng.
```text
Context: App Router Next.js frontend.
Task 5: Build a high-speed Check-in Scanner UI at `app/scan/page.tsx` optimized for tablets/mobile.
1. Integrate `react-qr-reader` or `html5-qrcode`.
2. On successful scan, automatically trigger the `POST /checkin` API.
3. Render a massive, highly visible full-screen overlay (Green for "Success", Red for "Invalid/Already Scanned").
4. Auto-reset the UI after 2 seconds to scan the next person seamlessly.
Provide the React code.
```

### Phase 6: Core Automation - Email Queue System
**Mục tiêu:** Gửi 1000+ mail với vé QR Code mà không nghẽn server.
```text
Context: NestJS standard backend.
Task 6: Implement a heavy-duty Email Queue using `BullMQ` and Redis.
1. Set up an `EmailModule` and configure a Bull Queue 'email-queue'.
2. Create an `EmailProcessor` worker that simulates rendering an HTML ticket (with the attendee's name and QR code link) and sending via Nodemailer/SES.
3. Create `POST /attendees/send-tickets` to bulk-add pending attendees to this queue.
Output the setup, provider, and processor files.
```

### Phase 7: Realtime WebSockets Dashboard
**Mục tiêu:** Bảng điều khiển cập nhật tick-tắc lượng người vừa vào cổng.
```text
Context: Next.js + NestJS.
Task 7: Add Realtime Check-in Stats.
1. NestJS: Create `CheckinGateway` (@WebSocketGateway). Emit `attendee.checked_in` event from `CheckinService` upon successful ticket scan.
2. Next.js: Create a live dashboard component that connects via `socket.io-client` to update "Total Attendees" and "Checked In" statistics instantly via React state without page refreshes.
Provide backend gateway and frontend component.
```
