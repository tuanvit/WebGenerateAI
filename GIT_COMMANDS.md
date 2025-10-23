# Git Commands để đẩy code lên GitHub

## Sau khi tạo repository trên GitHub, chạy các lệnh sau:

```bash
# Thêm remote origin (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/ai-prompt-generator-for-teachers.git

# Đổi tên branch chính thành main (nếu cần)
git branch -M main

# Push code lên GitHub lần đầu
git push -u origin main
```

## Các lệnh Git hữu ích khác:

```bash
# Kiểm tra trạng thái
git status

# Xem lịch sử commit
git log --oneline

# Tạo branch mới cho feature
git checkout -b feature/new-feature

# Push branch mới
git push -u origin feature/new-feature

# Merge branch
git checkout main
git merge feature/new-feature

# Pull code mới nhất
git pull origin main
```

## Workflow đề xuất:

1. **Tạo branch cho mỗi feature mới**
2. **Commit thường xuyên với message rõ ràng**
3. **Push lên GitHub để backup**
4. **Tạo Pull Request khi hoàn thành feature**
5. **Merge vào main branch**

## Commit message format:

```
✨ feat: add new feature
🐛 fix: fix bug
📝 docs: update documentation
🎨 style: improve UI/UX
♻️ refactor: refactor code
⚡ perf: improve performance
✅ test: add tests
🔧 config: update configuration
```