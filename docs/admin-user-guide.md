# Hướng dẫn sử dụng Admin Panel

## Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Bắt đầu sử dụng](#bắt-đầu-sử-dụng)
3. [Dashboard - Tổng quan](#dashboard---tổng-quan)
4. [Quản lý AI Tools](#quản-lý-ai-tools)
5. [Quản lý Templates](#quản-lý-templates)
6. [Backup & Restore](#backup--restore)
7. [Cài đặt hệ thống](#cài-đặt-hệ-thống)
8. [Khắc phục sự cố](#khắc-phục-sự-cố)
9. [FAQ](#faq)

---

## Giới thiệu

Admin Panel là hệ thống quản lý toàn diện cho phép bạn quản lý 40+ AI tools và templates một cách dễ dàng, được thiết kế đặc biệt cho người dùng không có kiến thức kỹ thuật.

### Tính năng chính

- **Dashboard**: Xem thống kê tổng quan và hoạt động hệ thống
- **AI Tools Management**: Quản lý 40+ công cụ AI với đầy đủ thông tin
- **Templates Management**: Tạo và quản lý mẫu prompt cho giáo dục
- **Backup & Restore**: Sao lưu và khôi phục dữ liệu an toàn
- **Settings**: Cấu hình hệ thống và quyền truy cập

### Yêu cầu hệ thống

- Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)
- Kết nối internet ổn định
- Tài khoản admin được cấp quyền
- Độ phân giải màn hình tối thiểu: 1024x768

---

## Bắt đầu sử dụng

### Đăng nhập

1. **Truy cập trang đăng nhập**
   - Mở trình duyệt và truy cập URL admin panel
   - Nhấp vào "Đăng nhập" ở góc trên bên phải

2. **Nhập thông tin đăng nhập**
   - Email/username của tài khoản admin
   - Mật khẩu
   - Nhấp "Đăng nhập"

3. **Xác thực quyền admin**
   - Hệ thống sẽ kiểm tra quyền admin
   - Nếu có quyền admin → chuyển đến dashboard
   - Nếu không có quyền → chuyển về trang chính

### Điều hướng

**Menu bên trái:**
- **Tổng quan**: Dashboard với thống kê
- **AI Tools**: Quản lý 40+ công cụ AI
- **Templates**: Quản lý mẫu prompt
- **Backup & Restore**: Sao lưu và khôi phục
- **Cài đặt**: Cấu hình hệ thống

**Thanh điều hướng trên:**
- **Breadcrumb**: Hiển thị vị trí hiện tại
- **Menu mobile**: Nút menu cho thiết bị di động
- **User menu**: Thông tin user và đăng xuất

---

## Dashboard - Tổng quan

Dashboard cung cấp cái nhìn tổng quan về tình trạng hệ thống và các hoạt động quan trọng.

### Thống kê tổng quan

**AI Tools Stats:**
- **Tổng số**: Tổng AI tools trong hệ thống
- **Hoạt động**: Tools được sử dụng trong 30 ngày qua
- **Mới thêm**: Tools được thêm trong tuần qua
- **Cần cập nhật**: Tools chưa cập nhật > 90 ngày

**Templates Stats:**
- **Tổng số**: Tổng templates có sẵn
- **Phổ biến**: Templates được sử dụng nhiều nhất
- **Mới tạo**: Templates tạo trong tuần qua
- **Cần review**: Templates chưa được kiểm duyệt

### Biểu đồ phân tích

- **Phân bố AI Tools theo danh mục**: Biểu đồ tròn hiển thị tỷ lệ tools theo 7 danh mục
- **Thống kê sử dụng Templates**: Biểu đồ cột theo môn học và lớp
- **Xu hướng hoạt động**: Biểu đồ đường theo thời gian

### Tình trạng hệ thống

**System Health Indicators:**
- 🟢 **Xanh**: Hoạt động bình thường
- 🟡 **Vàng**: Cảnh báo, cần chú ý
- 🔴 **Đỏ**: Lỗi, cần xử lý ngay

**Metrics:**
- **Response Time**: Thời gian phản hồi API
- **Database Load**: Tải database hiện tại
- **Storage Usage**: Dung lượng đã sử dụng

---

## Quản lý AI Tools

### Tổng quan AI Tools

Hệ thống quản lý 40+ AI tools được phân loại theo 7 danh mục:

1. **TEXT_GENERATION** (Tạo văn bản)
   - ChatGPT, Gemini, Copilot, Perplexity AI, Tome

2. **PRESENTATION** (Thuyết trình)
   - Canva AI, Gamma App

3. **IMAGE** (Hình ảnh)
   - Microsoft Designer, Leonardo AI

4. **VIDEO** (Video)
   - HeyGen, Synthesia, Pictory, ElevenLabs

5. **SIMULATION** (Mô phỏng)
   - PhET Simulation, Labster, Tinkercad, CoSpaces Edu, Chemix AI, GeoGebra, Desmos, MakeCode, Scratch

6. **ASSESSMENT** (Đánh giá)
   - Quizizz AI, QuestionWell, Formative AI, Kahoot, Blooket

7. **DATA_ANALYSIS** (Phân tích dữ liệu)
   - Google Earth, ArcGIS StoryMaps, Gapminder, Flourish, Datawrapper, TimelineJS, Wolfram Alpha

### Thêm AI Tool mới

**Bước 1: Mở form thêm mới**
1. Truy cập trang "AI Tools"
2. Nhấp nút "Thêm AI Tool" (màu xanh, góc trên bên phải)

**Bước 2: Điền thông tin cơ bản**
- **Tên**: Tên chính thức của AI tool
- **Mô tả**: Mô tả chi tiết tính năng và cách sử dụng
- **URL**: Đường dẫn truy cập tool (bắt đầu với https://)
- **Danh mục**: Chọn 1 trong 7 danh mục phù hợp

**Bước 3: Cấu hình phân loại**
- **Môn học**: Chọn các môn học phù hợp (có thể chọn nhiều)
- **Lớp**: Chọn lớp 6, 7, 8, 9 (có thể chọn nhiều)
- **Use Case**: Mô tả trường hợp sử dụng cụ thể

**Bước 4: Thông tin bổ sung**
- **Hỗ trợ tiếng Việt**: Đánh dấu nếu tool hiểu tiếng Việt
- **Độ khó**: Beginner/Intermediate/Advanced
- **Tính năng**: Danh sách các tính năng chính
- **Mô hình giá**: Free/Freemium/Paid
- **Hướng dẫn tích hợp**: Cách sử dụng tool hiệu quả
- **Mẫu prompt**: Ví dụ prompt để bắt đầu
- **Tools liên quan**: Các tools khác có thể kết hợp

### Thao tác hàng loạt

**Chỉnh sửa hàng loạt:**
1. Chọn nhiều AI Tools bằng checkbox
2. Nhấp "Chỉnh sửa hàng loạt"
3. Thay đổi các thuộc tính chung
4. Áp dụng cho tất cả

**Xuất/Nhập dữ liệu:**
- **Xuất**: Chọn tools → "Xuất" → Chọn định dạng (JSON/CSV)
- **Nhập**: "Nhập" → Chọn file → Xem trước → Xác nhận

---

## Quản lý Templates

### Tổng quan Templates

Templates là các mẫu prompt được thiết kế sẵn cho giáo dục, bao gồm:

**Các loại Template:**
1. **Lesson Plan**: Kế hoạch bài dạy
2. **Presentation**: Bài thuyết trình
3. **Assessment**: Đánh giá, kiểm tra
4. **Interactive**: Hoạt động tương tác
5. **Research**: Nghiên cứu, tìm hiểu

### Tạo Template mới

**Bước 1: Khởi tạo**
1. Truy cập "Templates" → "Tạo Template"
2. Điền thông tin cơ bản (tên, mô tả, môn học, lớp)

**Bước 2: Tạo nội dung với Variables**
```
Tạo kế hoạch bài dạy về {{chu_de}} cho lớp {{lop}}.

Mục tiêu:
- Học sinh hiểu được {{muc_tieu_1}}
- Học sinh có thể {{muc_tieu_2}}

Hoạt động:
1. Khởi động ({{thoi_gian_khoi_dong}} phút): {{hoat_dong_khoi_dong}}
2. Hoạt động chính ({{thoi_gian_chinh}} phút): {{hoat_dong_chinh}}
3. Củng cố ({{thoi_gian_cung_co}} phút): {{hoat_dong_cung_co}}
```

**Bước 3: Định nghĩa Variables**
- **Tên**: chu_de (không dấu, gạch dưới)
- **Nhãn**: "Chủ đề bài học"
- **Mô tả**: "Nhập chủ đề chính của bài học"
- **Loại**: Text/Number/Select/Textarea
- **Bắt buộc**: Có/Không

**Bước 4: Thêm Examples**
- Tạo ví dụ cụ thể với dữ liệu mẫu
- Hiển thị kết quả mong đợi

### Làm việc với Variables

**Cú pháp**: `{{ten_bien}}`
- Chỉ chứa chữ cái, số và gạch dưới
- Không có dấu cách hoặc ký tự đặc biệt
- Phân biệt hoa thường

**Các loại Variables:**
- **Text**: Tên, tiêu đề, từ khóa
- **Textarea**: Mô tả, nội dung chi tiết
- **Number**: Thời gian, số lượng, điểm số
- **Select**: Danh sách có sẵn

---

## Backup & Restore

### Các loại Backup

**1. Automatic Backup**
- Chạy hàng ngày vào 2:00 AM
- Backup toàn bộ dữ liệu
- Lưu trữ 30 ngày gần nhất

**2. Manual Backup**
- Tạo khi cần thiết
- Chọn dữ liệu cụ thể
- Lưu trữ không giới hạn

**3. Scheduled Backup**
- Thiết lập lịch tùy chỉnh
- Email thông báo kết quả

### Tạo Backup

**Manual Backup:**
1. "Backup & Restore" → "Tạo Backup"
2. Cấu hình: tên, mô tả, loại dữ liệu
3. Tùy chọn: định dạng, nén, mã hóa
4. Thực hiện và download

**Scheduled Backup:**
1. "Scheduled Backup" → "Tạo lịch mới"
2. Cấu hình lịch: tần suất, thời gian
3. Cấu hình dữ liệu và retention
4. Kích hoạt lịch

### Khôi phục dữ liệu

**⚠️ CẢNH BÁO**: Restore sẽ ghi đè dữ liệu hiện tại

**Từ Backup có sẵn:**
1. Tab "Restore" → Chọn backup
2. Cấu hình restore mode
3. Backup hiện tại tự động
4. Thực hiện restore

**Từ File:**
1. "Restore từ file" → Upload file
2. Preview dữ liệu
3. Cấu hình và thực hiện

---

## Cài đặt hệ thống

### Cài đặt chung

**General Settings:**
- Site Name, Description
- Default Language, Timezone
- Date Format

**Performance Settings:**
- Cache Duration (300s)
- Max File Upload (10MB)
- Database Pool Size
- API Rate Limit

**Security Settings:**
- Session Timeout (30 phút)
- Password Policy
- Two-Factor Auth
- IP Whitelist

### Quản lý người dùng

**Roles:**
- **Admin**: Full access
- **Editor**: Manage content
- **Viewer**: Read-only

**User Management:**
- Thêm/sửa/vô hiệu hóa user
- Assign roles
- Reset password
- Audit activity

---

## Khắc phục sự cố

### Sự cố thường gặp

**1. Không thể đăng nhập Admin Panel**

*Triệu chứng:*
- Lỗi "Unauthorized" hoặc "Access Denied"
- Được chuyển về trang chính sau đăng nhập

*Giải pháp:*
1. Kiểm tra role trong database: `SELECT role FROM users WHERE email = "user@example.com"`
2. Cập nhật role: `UPDATE users SET role = "admin" WHERE email = "user@example.com"`
3. Clear browser cache
4. Restart server nếu cần

**2. AI Tools không hiển thị**

*Triệu chứng:*
- Loading spinner không dừng
- "No data available"
- Lỗi 500

*Giải pháp:*
1. Kiểm tra database connection
2. Clear cache và restart server
3. Kiểm tra network tab trong DevTools
4. Optimize database với indexes

**3. Template variables không render**

*Triệu chứng:*
- Variables hiển thị `{{variable_name}}`
- Lỗi "Variable not found"

*Giải pháp:*
1. Kiểm tra syntax: `{{variable_name}}` (không space)
2. Verify variable definitions trong database
3. Test với dữ liệu đơn giản
4. Kiểm tra encoding UTF-8

**4. Backup thất bại**

*Triệu chứng:*
- Process bị dừng giữa chừng
- File size 0 bytes
- Timeout error

*Giải pháp:*
1. Kiểm tra disk space: `df -h`
2. Backup trong giờ ít traffic
3. Tăng timeout
4. Sử dụng incremental backup

**5. Import CSV/JSON thất bại**

*Triệu chứng:*
- "Invalid file format"
- Import stuck ở 0%
- Encoding error

*Giải pháp:*
1. Kiểm tra file encoding (UTF-8)
2. Validate file structure
3. Split file lớn thành nhiều file nhỏ
4. Test với file sample

### Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề sau khi thử các giải pháp trên:
- Email: admin@example.com
- Hotline: 1900-xxxx
- Ticket system: support.example.com

---

## FAQ

**Q: Làm thế nào để thêm AI Tool mới?**
A: Truy cập trang AI Tools, nhấp "Thêm AI Tool", điền đầy đủ thông tin và lưu.

**Q: Tại sao không thể xóa AI Tool?**
A: Có thể do tool đang được sử dụng trong templates hoặc không có quyền xóa.

**Q: Template variables hoạt động như thế nào?**
A: Variables được đặt trong `{{}}` và thay thế bằng giá trị thực khi render.

**Q: Làm sao để backup dữ liệu?**
A: Truy cập "Backup & Restore", chọn "Tạo backup mới", cấu hình và thực hiện.

**Q: Dashboard không hiển thị dữ liệu?**
A: Kiểm tra kết nối internet, quyền truy cập, thử refresh trang.

**Q: Có thể khôi phục dữ liệu đã xóa không?**
A: Có, nếu có backup. Sử dụng tính năng restore từ backup gần nhất.

**Q: Làm thế nào để thay đổi mật khẩu admin?**
A: Vào Settings → Users → Chọn user → Reset password.

**Q: Hệ thống có hỗ trợ mobile không?**
A: Có, giao diện responsive hoạt động tốt trên tablet và mobile.

---

## Phụ lục

### Phím tắt hữu ích
- `Ctrl + S`: Lưu form hiện tại
- `Esc`: Đóng modal/dialog
- `Tab`: Di chuyển giữa các trường input

### Giới hạn hệ thống
- Max file upload: 10MB
- Max concurrent users: 100
- Backup retention: 30 ngày (auto), không giới hạn (manual)
- Session timeout: 30 phút

### Changelog
- **v1.0.0** (2024-01-15): Phiên bản đầu tiên
- **v1.1.0** (2024-01-20): Thêm help system và tooltips
- **v1.2.0** (2024-01-25): Cải thiện performance và UX

---

*Tài liệu này được cập nhật lần cuối: 2024-01-25*
*Phiên bản hệ thống: 1.2.0*