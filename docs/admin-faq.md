# Admin Panel - Câu hỏi thường gặp (FAQ)

## Mục lục

1. [Đăng nhập và Xác thực](#đăng-nhập-và-xác-thực)
2. [Quản lý AI Tools](#quản-lý-ai-tools)
3. [Quản lý Templates](#quản-lý-templates)
4. [Backup và Restore](#backup-và-restore)
5. [Dashboard và Thống kê](#dashboard-và-thống-kê)
6. [Import/Export dữ liệu](#importexport-dữ-liệu)
7. [Hiệu suất và Tối ưu](#hiệu-suất-và-tối-ưu)
8. [Bảo mật](#bảo-mật)
9. [Khắc phục sự cố](#khắc-phục-sự-cố)
10. [Tính năng nâng cao](#tính-năng-nâng-cao)

---

## Đăng nhập và Xác thực

### Q: Làm thế nào để truy cập Admin Panel?
**A:** 
1. Truy cập URL của hệ thống
2. Nhấp "Đăng nhập" ở góc trên bên phải
3. Nhập email và mật khẩu của tài khoản admin
4. Hệ thống sẽ tự động chuyển đến admin dashboard nếu có quyền

### Q: Tại sao tôi không thể truy cập Admin Panel mặc dù đã đăng nhập?
**A:** Có một số nguyên nhân có thể:
- Tài khoản không có role "admin"
- Session đã hết hạn
- Browser cache cũ
- **Giải pháp**: Liên hệ admin khác để cấp quyền hoặc clear browser cache

### Q: Làm thế nào để thay đổi mật khẩu admin?
**A:**
1. Vào Settings → Users
2. Tìm tài khoản cần thay đổi
3. Nhấp "Edit" → "Reset Password"
4. Nhập mật khẩu mới và xác nhận

### Q: Tài khoản admin có thể bị khóa không?
**A:** Có, trong các trường hợp:
- Đăng nhập sai quá nhiều lần (5 lần)
- Admin khác vô hiệu hóa tài khoản
- Hết hạn sử dụng (nếu có cấu hình)

---

## Quản lý AI Tools

### Q: Làm thế nào để thêm AI Tool mới?
**A:**
1. Truy cập trang "AI Tools"
2. Nhấp nút "Thêm AI Tool" (màu xanh)
3. Điền đầy đủ thông tin bắt buộc
4. Nhấp "Lưu AI Tool"

### Q: Tại sao không thể xóa AI Tool?
**A:** Có thể do:
- AI Tool đang được sử dụng trong templates
- Không có quyền xóa
- Tool có dependencies với dữ liệu khác
- **Giải pháp**: Kiểm tra dependencies trước khi xóa

### Q: Làm thế nào để cập nhật thông tin nhiều AI Tools cùng lúc?
**A:**
1. Chọn các AI Tools bằng checkbox
2. Nhấp "Chỉnh sửa hàng loạt"
3. Chọn thuộc tính cần thay đổi
4. Nhập giá trị mới và áp dụng

### Q: AI Tool nào thuộc danh mục nào?
**A:** Hệ thống có 7 danh mục chính:
- **TEXT_GENERATION**: ChatGPT, Gemini, Copilot, Perplexity AI
- **PRESENTATION**: Canva AI, Gamma App, Tome
- **IMAGE**: Microsoft Designer, Leonardo AI
- **VIDEO**: HeyGen, Synthesia, Pictory, ElevenLabs
- **SIMULATION**: PhET, Labster, Tinkercad, CoSpaces Edu, GeoGebra, Desmos
- **ASSESSMENT**: Quizizz AI, QuestionWell, Formative AI, Kahoot, Blooket
- **DATA_ANALYSIS**: Google Earth, ArcGIS StoryMaps, Gapminder, Flourish

### Q: Làm thế nào để kiểm tra AI Tool có hoạt động không?
**A:**
1. Nhấp vào tên AI Tool để xem chi tiết
2. Nhấp vào URL để test trực tiếp
3. Kiểm tra phần "Last Updated" để biết lần cập nhật cuối
4. Xem phần "Status" nếu có

---

## Quản lý Templates

### Q: Template variables hoạt động như thế nào?
**A:** 
- Variables được đặt trong dấu `{{}}`: `{{ten_bien}}`
- Khi render, variables sẽ được thay thế bằng giá trị thực
- Ví dụ: `{{chu_de}}` → "Phương trình bậc nhất"

### Q: Tại sao template không render đúng variables?
**A:** Kiểm tra:
- Syntax đúng: `{{variable_name}}` (không có space)
- Tên variable chỉ chứa chữ cái, số, gạch dưới
- Variable đã được định nghĩa trong form
- Không có ký tự đặc biệt trong tên variable

### Q: Làm thế nào để tạo template với nhiều variables?
**A:**
1. Viết nội dung template với các `{{variable}}`
2. Trong phần "Variables", thêm từng variable:
   - Tên: tên_variable (không dấu)
   - Nhãn: tên hiển thị
   - Loại: Text/Number/Select/Textarea
   - Bắt buộc: có/không

### Q: Có thể sao chép template không?
**A:** Có:
1. Tìm template cần sao chép
2. Nhấp biểu tượng "Copy"
3. Chỉnh sửa thông tin mới
4. Lưu template mới

### Q: Làm thế nào để xem trước template?
**A:**
1. Trong form chỉnh sửa, nhấp tab "Xem trước"
2. Hoặc từ danh sách, nhấp biểu tượng mắt
3. Điền giá trị cho các variables
4. Xem kết quả render real-time

---

## Backup và Restore

### Q: Làm sao để backup dữ liệu?
**A:**
1. Truy cập "Backup & Restore"
2. Chọn "Tạo backup mới"
3. Cấu hình: tên, mô tả, loại dữ liệu
4. Nhấp "Tạo backup" và đợi hoàn thành

### Q: Backup tự động hoạt động như thế nào?
**A:**
- Chạy hàng ngày vào 2:00 AM
- Backup toàn bộ dữ liệu AI Tools và Templates
- Lưu trữ 30 ngày gần nhất
- Tự động xóa backup cũ

### Q: Có thể khôi phục dữ liệu đã xóa không?
**A:** Có, nếu có backup:
1. Vào tab "Restore"
2. Chọn backup gần nhất trước khi xóa
3. Chọn "Selective restore" để chỉ restore dữ liệu cần thiết
4. Thực hiện restore

### Q: Backup có an toàn không?
**A:** Có:
- File backup được mã hóa (tùy chọn)
- Lưu trữ an toàn trên server
- Có thể download về máy cá nhân
- Audit log ghi lại mọi thao tác backup/restore

### Q: Restore có ghi đè dữ liệu hiện tại không?
**A:** Tùy vào mode:
- **Full restore**: Ghi đè toàn bộ
- **Selective restore**: Chỉ restore dữ liệu đã chọn
- **Merge mode**: Kết hợp với dữ liệu hiện tại
- Hệ thống tự động tạo backup hiện tại trước khi restore

---

## Dashboard và Thống kê

### Q: Dashboard không hiển thị dữ liệu?
**A:** Kiểm tra:
- Kết nối internet ổn định
- Quyền truy cập dashboard
- Refresh trang (F5)
- Clear browser cache
- Kiểm tra console để xem lỗi

### Q: Thống kê có chính xác không?
**A:** Có:
- Dữ liệu được cập nhật real-time
- Cache 5 phút để tối ưu performance
- Có thể force refresh bằng cách reload trang

### Q: Làm thế nào để xuất báo cáo?
**A:**
1. Vào Dashboard
2. Nhấp "Export Report" ở góc trên
3. Chọn định dạng (PDF/Excel/CSV)
4. Chọn khoảng thời gian
5. Download file

### Q: Có thể tùy chỉnh dashboard không?
**A:** Hiện tại chưa hỗ trợ tùy chỉnh layout, nhưng có thể:
- Filter dữ liệu theo khoảng thời gian
- Chọn loại biểu đồ hiển thị
- Ẩn/hiện các widget

---

## Import/Export dữ liệu

### Q: Định dạng file nào được hỗ trợ?
**A:**
- **Import**: JSON, CSV, Excel (.xlsx)
- **Export**: JSON, CSV, Excel (.xlsx)
- **Backup**: JSON (compressed), SQL dump

### Q: Tại sao import file CSV thất bại?
**A:** Kiểm tra:
- File encoding phải là UTF-8
- Header columns đúng format
- Không có dữ liệu trống trong required fields
- File size < 10MB
- **Giải pháp**: Sử dụng template CSV mẫu

### Q: Làm thế nào để import dữ liệu lớn?
**A:**
1. Split file lớn thành nhiều file nhỏ (< 1000 records/file)
2. Import từng file một
3. Hoặc sử dụng tính năng "Batch Import"
4. Monitor progress và xử lý lỗi từng batch

### Q: Import có ghi đè dữ liệu cũ không?
**A:** Tùy vào cấu hình:
- **Overwrite**: Ghi đè dữ liệu trùng ID
- **Skip**: Bỏ qua dữ liệu trùng
- **Rename**: Tạo bản sao với tên mới
- **Merge**: Kết hợp dữ liệu

---

## Hiệu suất và Tối ưu

### Q: Tại sao hệ thống chạy chậm?
**A:** Có thể do:
- Quá nhiều dữ liệu không được phân trang
- Database cần optimize
- Server overload
- Network chậm
- **Giải pháp**: Liên hệ admin để optimize

### Q: Làm thế nào để tăng tốc độ loading?
**A:**
- Sử dụng filter để giảm dữ liệu hiển thị
- Clear browser cache định kỳ
- Sử dụng pagination thay vì load all
- Đóng các tab không cần thiết

### Q: Cache hoạt động như thế nào?
**A:**
- Dashboard cache 5 phút
- AI Tools list cache 10 phút
- Templates cache 15 phút
- Static assets cache 1 ngày
- Có thể force refresh bằng Ctrl+F5

---

## Bảo mật

### Q: Dữ liệu có được bảo mật không?
**A:** Có:
- HTTPS encryption cho tất cả traffic
- Database encryption at rest
- Session timeout 30 phút
- Audit log cho mọi thao tác admin
- IP whitelist (tùy chọn)

### Q: Có thể thiết lập 2FA không?
**A:** Có:
1. Vào Settings → Security
2. Enable "Two-Factor Authentication"
3. Scan QR code với app authenticator
4. Nhập code xác thực

### Q: Làm thế nào để xem audit logs?
**A:**
1. Vào Settings → Audit Logs
2. Filter theo user, action, date range
3. Export logs nếu cần
4. Logs được lưu 90 ngày

---

## Khắc phục sự cố

### Q: Lỗi "500 Internal Server Error" nghĩa là gì?
**A:** Lỗi server nội bộ:
- Database connection issue
- Server overload
- Code error
- **Giải pháp**: Refresh trang, nếu vẫn lỗi thì liên hệ admin

### Q: Tại sao không thể upload file?
**A:** Kiểm tra:
- File size < 10MB
- Định dạng file được hỗ trợ
- Kết nối internet ổn định
- Browser không block upload

### Q: Session bị logout liên tục?
**A:** Có thể do:
- Session timeout (30 phút)
- Multiple login sessions
- Browser cookie issues
- **Giải pháp**: Clear cookies, đăng nhập lại

### Q: Dữ liệu bị mất sau khi cập nhật?
**A:**
1. Kiểm tra Audit Logs để xem ai đã thay đổi
2. Restore từ backup gần nhất
3. Liên hệ admin để investigate
4. Trong tương lai: backup trước khi thay đổi lớn

---

## Tính năng nâng cao

### Q: Có thể tích hợp với hệ thống khác không?
**A:** Có API endpoints cho:
- AI Tools CRUD operations
- Templates management
- User management
- Backup/restore operations
- Documentation: `/api/docs`

### Q: Làm thế nào để thiết lập webhook?
**A:**
1. Vào Settings → Integrations
2. Add webhook URL
3. Chọn events cần notify
4. Test webhook connection

### Q: Có mobile app không?
**A:** Chưa có mobile app riêng, nhưng:
- Web interface responsive
- Hoạt động tốt trên tablet
- Mobile browser support

### Q: Có thể customize giao diện không?
**A:** Hiện tại hỗ trợ:
- Dark/Light theme
- Language settings
- Layout preferences
- Custom logo (admin setting)

---

## Liên hệ hỗ trợ

### Khi nào cần liên hệ support?
- Lỗi không thể tự khắc phục
- Cần cấp quyền admin
- Vấn đề bảo mật
- Feature request
- Data recovery

### Thông tin liên hệ:
- **Email**: admin@example.com
- **Hotline**: 1900-xxxx
- **Ticket System**: support.example.com
- **Documentation**: docs.example.com

### Thông tin cần cung cấp khi báo lỗi:
1. Mô tả chi tiết vấn đề
2. Các bước để reproduce lỗi
3. Screenshot/video nếu có
4. Browser và OS version
5. Thời gian xảy ra lỗi
6. User account gặp vấn đề

---

*FAQ này được cập nhật thường xuyên. Nếu không tìm thấy câu trả lời, vui lòng liên hệ support.*

*Cập nhật lần cuối: 2024-01-25*