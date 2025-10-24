# 🤝 Contributing Guide

Cảm ơn bạn quan tâm đến việc đóng góp cho AI Prompt Generator for Teachers! Hướng dẫn này sẽ giúp bạn bắt đầu.

## 🎯 Cách đóng góp

### 1. Báo cáo lỗi (Bug Reports)
### 2. Đề xuất tính năng (Feature Requests)
### 3. Cải thiện code (Code Contributions)
### 4. Cải thiện documentation

---

## 🐛 Báo cáo lỗi

### Trước khi báo cáo
- [ ] Kiểm tra [Issues](https://github.com/tuanvit/WebGenerateAI/issues) hiện có
- [ ] Đảm bảo sử dụng phiên bản mới nhất
- [ ] Thử reproduce lỗi

### Template báo cáo lỗi
```markdown
**Mô tả lỗi:**
Mô tả ngắn gọn về lỗi.

**Các bước reproduce:**
1. Truy cập '...'
2. Click vào '...'
3. Scroll xuống '...'
4. Thấy lỗi

**Kết quả mong đợi:**
Mô tả những gì bạn mong đợi sẽ xảy ra.

**Kết quả thực tế:**
Mô tả những gì thực sự xảy ra.

**Screenshots:**
Nếu có, thêm screenshots để giải thích vấn đề.

**Môi trường:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js: [e.g. 18.0.0]
```

---

## 💡 Đề xuất tính năng

### Template đề xuất
```markdown
**Tính năng đề xuất:**
Mô tả ngắn gọn về tính năng.

**Vấn đề hiện tại:**
Mô tả vấn đề mà tính năng này sẽ giải quyết.

**Giải pháp đề xuất:**
Mô tả chi tiết về cách tính năng sẽ hoạt động.

**Giải pháp thay thế:**
Mô tả các giải pháp khác bạn đã cân nhắc.

**Thông tin bổ sung:**
Thêm context hoặc screenshots về đề xuất.
```

---

## 💻 Đóng góp Code

### Setup Development Environment

1. **Fork repository**
```bash
# Fork trên GitHub, sau đó clone
git clone https://github.com/your-username/WebGenerateAI.git
cd WebGenerateAI
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**
```bash
cp .env.example .env
# Cập nhật .env với thông tin cần thiết
```

4. **Setup database**
```bash
npx prisma db push
npm run seed
```

5. **Khởi động development server**
```bash
npm run dev
```

### Development Workflow

1. **Tạo branch mới**
```bash
git checkout -b feature/amazing-feature
# hoặc
git checkout -b fix/bug-fix
```

2. **Commit changes**
```bash
git add .
git commit -m "feat: add amazing feature"
```

3. **Push và tạo PR**
```bash
git push origin feature/amazing-feature
```

### Commit Message Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `style`: Thay đổi formatting, không ảnh hưởng logic
- `refactor`: Refactor code
- `test`: Thêm hoặc sửa tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add template preview functionality
fix: resolve Google OAuth authentication issue
docs: update installation guide
style: format admin dashboard components
refactor: optimize database queries
test: add unit tests for template service
chore: update dependencies
```

---

## 🧪 Testing

### Chạy tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

### Viết tests

**Unit Test Example:**
```typescript
// src/components/admin/__tests__/AdminLayout.test.tsx
import { render, screen } from '@testing-library/react'
import AdminLayout from '../AdminLayout'

describe('AdminLayout', () => {
  it('renders navigation menu', () => {
    render(<AdminLayout>Content</AdminLayout>)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
```

**API Test Example:**
```typescript
// src/test/integration/admin-api.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/app/api/admin/dashboard/route'

describe('/api/admin/dashboard', () => {
  it('returns dashboard data', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' })
        expect(res.status).toBe(200)
      }
    })
  })
})
```

---

## 📝 Code Style

### ESLint & Prettier
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript
- Sử dụng strict mode
- Định nghĩa types rõ ràng
- Tránh `any` type

### React Components
```typescript
// Good
interface Props {
  title: string
  onSubmit: (data: FormData) => void
}

export default function MyComponent({ title, onSubmit }: Props) {
  return <div>{title}</div>
}

// Bad
export default function MyComponent(props: any) {
  return <div>{props.title}</div>
}
```

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE.ts`
- Tests: `*.test.tsx` hoặc `*.spec.tsx`

---

## 📚 Documentation

### Code Comments
```typescript
/**
 * Generates AI-optimized prompts for educational content
 * @param input - Educational requirements and parameters
 * @param targetTool - Target AI tool (ChatGPT, Gemini, etc.)
 * @returns Optimized prompt string
 */
export function generatePrompt(input: PromptInput, targetTool: AITool): string {
  // Implementation
}
```

### README Updates
- Cập nhật tính năng mới
- Thêm examples
- Cập nhật installation steps

---

## 🔍 Code Review Process

### Trước khi submit PR
- [ ] Code builds successfully
- [ ] All tests pass
- [ ] ESLint warnings resolved
- [ ] TypeScript errors fixed
- [ ] Documentation updated
- [ ] Self-review completed

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

---

## 🏗️ Architecture Guidelines

### Folder Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable components
├── lib/                # Utilities & configurations
├── types/              # TypeScript definitions
└── test/               # Test utilities
```

### Component Structure
```typescript
// 1. Imports
import React from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface Props {
  title: string
}

// 3. Component
export default function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState('')
  
  // 5. Handlers
  const handleClick = () => {
    // Logic
  }
  
  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Click me</Button>
    </div>
  )
}
```

### API Routes
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = schema.parse(body)
    
    // Logic here
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

---

## 🎯 Priority Areas

### High Priority
- 🐛 Bug fixes
- 🔒 Security improvements
- ♿ Accessibility improvements
- 🚀 Performance optimizations

### Medium Priority
- ✨ New features
- 🎨 UI/UX improvements
- 📱 Mobile responsiveness
- 🌐 Internationalization

### Low Priority
- 📝 Documentation improvements
- 🧹 Code cleanup
- 🔧 Developer experience

---

## 📞 Liên hệ

- **GitHub Issues**: [Create Issue](https://github.com/tuanvit/WebGenerateAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tuanvit/WebGenerateAI/discussions)
- **Email**: nguyentuanviet12k1@gmail.com

---

## 🙏 Cảm ơn

Cảm ơn tất cả contributors đã đóng góp cho dự án:

- [@tuanvit](https://github.com/tuanvit) - Project maintainer

**🌟 Mọi đóng góp đều được trân trọng!**