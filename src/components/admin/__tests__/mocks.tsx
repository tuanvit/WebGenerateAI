// Mock components for testing
export const AdminLayout = ({ children, currentSection }: any) => {
    return (
        <div>
            <nav>
                <h1>Admin Dashboard</h1>
                <a href="/admin/dashboard" className={currentSection === 'dashboard' ? 'bg-blue-100' : ''}>
                    Tổng quan
                </a>
                <a href="/admin/ai-tools" className={currentSection === 'ai-tools' ? 'bg-blue-100' : ''}>
                    AI Tools
                </a>
                <a href="/admin/templates" className={currentSection === 'templates' ? 'bg-blue-100' : ''}>
                    Templates
                </a>
                <a href="/admin/settings" className={currentSection === 'settings' ? 'bg-blue-100' : ''}>
                    Cài đặt
                </a>
            </nav>

            <div>
                <nav role="navigation" className="block">
                    <span>Admin</span>
                    <span>{currentSection === 'ai-tools' ? 'AI Tools' : currentSection}</span>
                </nav>
            </div>

            <div>
                <span>Test Admin</span>
                <span>admin@test.com</span>
                <button>Đăng xuất</button>
            </div>

            <button aria-label="Toggle menu">☰</button>

            <main>{children}</main>
        </div>
    )
}