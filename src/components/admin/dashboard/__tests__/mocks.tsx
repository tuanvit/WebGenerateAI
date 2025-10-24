// Mock components for testing
export const DashboardStats = ({ stats }: any) => {
    if (!stats) {
        return <div>Đang tải...</div>
    }

    return (
        <div>
            <article>
                <h3>Tổng số AI Tools</h3>
                <span>{stats.totalAITools.toLocaleString()}</span>
            </article>
            <article>
                <h3>Tổng số Templates</h3>
                <span>{stats.totalTemplates.toLocaleString()}</span>
            </article>
            <article>
                <h3>Người dùng hoạt động</h3>
                <span>{stats.activeUsers.toLocaleString()}</span>
            </article>
            <article>
                <h3>Tổng số Prompts</h3>
                <span>{stats.totalPrompts.toLocaleString()}</span>
            </article>
        </div>
    )
}