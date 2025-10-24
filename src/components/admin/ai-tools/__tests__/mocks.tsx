// Mock components for testing
export const AIToolsTable = ({ tools, onEdit, onDelete, onSelectTool, onSelectAll }: any) => (
    <div>
        <input type="checkbox" onChange={onSelectAll} />
        {tools.map((tool: any) => (
            <div key={tool.id}>
                <input type="checkbox" onChange={() => onSelectTool(tool.id)} />
                <span>{tool.name}</span>
                <span>{tool.category}</span>
                <span>{tool.vietnameseSupport ? 'Có' : 'Không'}</span>
                <span>{tool.subjects.join(', ')}</span>
                <span>{tool.gradeLevel.join(', ')}</span>
                <button onClick={() => onEdit(tool)}>Chỉnh sửa</button>
                <button onClick={() => onDelete(tool.id)}>Xóa</button>
            </div>
        ))}
        {tools.length === 0 && <div>Không có công cụ AI nào</div>}
    </div>
)

export const AIToolForm = ({ tool, onSave, onCancel }: any) => (
    <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        onSave({
            name: formData.get('name'),
            description: formData.get('description'),
            url: formData.get('url'),
            category: formData.get('category'),
        })
    }}>
        <label htmlFor="name">Tên công cụ</label>
        <input id="name" name="name" defaultValue={tool?.name} required />

        <label htmlFor="description">Mô tả</label>
        <textarea id="description" name="description" defaultValue={tool?.description} required />

        <label htmlFor="url">URL</label>
        <input id="url" name="url" type="url" defaultValue={tool?.url} required />

        <label htmlFor="category">Danh mục</label>
        <select id="category" name="category" defaultValue={tool?.category} required>
            <option value="TEXT_GENERATION">TEXT_GENERATION</option>
        </select>

        <label htmlFor="useCase">Trường hợp sử dụng</label>
        <input id="useCase" name="useCase" defaultValue={tool?.useCase} required />

        <fieldset>
            <legend>Môn học</legend>
            <input type="checkbox" value="Toán" />
            <input type="checkbox" value="Văn" />
        </fieldset>

        <fieldset>
            <legend>Lớp</legend>
            <input type="checkbox" value="6" />
            <input type="checkbox" value="7" />
        </fieldset>

        <label htmlFor="vietnameseSupport">Hỗ trợ tiếng Việt</label>
        <input id="vietnameseSupport" type="checkbox" defaultChecked={tool?.vietnameseSupport} />

        <button type="button" onClick={() => { }}>Thêm tính năng</button>
        <input placeholder="Nhập tính năng" />

        <button type="submit">Lưu</button>
        <button type="button" onClick={onCancel}>Hủy</button>
    </form>
)