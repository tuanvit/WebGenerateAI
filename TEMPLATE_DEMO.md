# Demo Template System - AI Prompt Generator

## Tính năng đã hoàn thành

### 1. Subject-specific Templates (Task 13.1) ✅

Đã tạo hệ thống template chuyên môn với:

#### **SubjectTemplateService**
- 3 template mẫu cho các môn học chính:
  - **Toán học**: Giáo án theo CV 5512 với cấu trúc 5 cột
  - **Ngữ văn**: Phân tích tác phẩm văn học
  - **Khoa học tự nhiên**: Thí nghiệm và mô phỏng

#### **TemplateRenderer Component**
- Form động dựa trên template variables
- Hỗ trợ các loại input: text, textarea, select, multiselect
- Preview template trước khi tạo prompt đầy đủ
- Validation cho các trường bắt buộc
- Ví dụ mẫu để người dùng tham khảo

#### **TemplateSelector Component**
- Hiển thị danh sách template phù hợp với môn học, lớp, loại output
- Filter và search template
- Hiển thị thông tin chi tiết: độ khó, compliance, tags
- Responsive design với loading states

#### **API Routes**
- `/api/templates` - Lấy danh sách template
- `/api/templates/render` - Render template với variables

#### **Integration với Generate Page**
- Toggle giữa chế độ "Tự do" và "Template"
- Tích hợp seamless với AI Tool Selector
- Hiển thị template form khi chọn template
- Auto-fill một số thông tin từ form chính

## Cách sử dụng

1. **Truy cập trang Generate**: http://localhost:3000/generate
2. **Chọn thông tin cơ bản**: Môn học, lớp, tên bài học
3. **Chuyển sang chế độ Template**: Click nút "Template"
4. **Chọn template phù hợp**: Từ danh sách được đề xuất
5. **Điền thông tin chi tiết**: Trong form template
6. **Xem trước**: Click "👁️ Xem trước" để preview
7. **Tạo prompt**: Click "🚀 Tạo Prompt" để tạo prompt đầy đủ

## Template Examples

### Toán học - Lớp 8
```
Tên bài: Phương trình bậc nhất một ẩn
Mục tiêu: HS hiểu khái niệm phương trình bậc nhất, biết giải và ứng dụng
Bối cảnh: Tính tuổi, tính chi phí mua hàng
Hoạt động khám phá: Cho HS giải bài toán tìm số tự nhiên
```

### Ngữ văn - Lớp 9
```
Tác phẩm: Tự tình II
Tác giả: Hồ Xuân Hương
Thể loại: Thơ
Mục tiêu: Hiểu nội dung và nghệ thuật, cảm nhận tâm trạng tác giả
```

### KHTN - Lớp 6
```
Bài học: Sự nở vì nhiệt của chất rắn
Lĩnh vực: Vật lý
Hiện tượng: Đường ray xe lửa có khe hở, dây điện chùng xuống mùa hè
Câu hỏi: Tại sao các vật rắn lại nở ra khi bị đun nóng?
```

## Tính năng nổi bật

- ✅ **Tuân thủ chuẩn giáo dục**: GDPT 2018, CV 5512
- ✅ **Responsive design**: Hoạt động tốt trên mobile và desktop
- ✅ **Vietnamese interface**: Hoàn toàn bằng tiếng Việt
- ✅ **Smart validation**: Kiểm tra dữ liệu đầu vào
- ✅ **Preview functionality**: Xem trước trước khi tạo
- ✅ **Example templates**: Ví dụ mẫu cho từng template
- ✅ **Integration ready**: Tích hợp với AI Tool recommendations

## Next Steps

Task tiếp theo sẽ là:
- **13.2**: Implement template selection engine
- **13.3**: Create template management UI  
- **13.4**: Integrate templates with existing prompt generation