// Mock components for testing
export const TemplatesTable = ({ templates, onEdit, onDelete, onPreview, onSelectTemplate, onSelectAll }: any) => (
    <div>
        <input type="checkbox" onChange={onSelectAll} />
        {templates.map((template: any) => (
            <div key={template.id}>
                <input type="checkbox" onChange={() => onSelectTemplate(template.id)} />
                <span>{template.name}</span>
                <span>{template.subject}</span>
                <span>{template.outputType}</span>
                <span>{template.difficulty}</span>
                <span>{template.gradeLevel.join(', ')}</span>
                {template.tags.map((tag: string) => <span key={tag}>{tag}</span>)}
                {template.compliance.map((comp: string) => <span key={comp}>{comp}</span>)}
                <button onClick={() => onEdit(template)}>Chỉnh sửa</button>
                <button onClick={() => onDelete(template.id)}>Xóa</button>
                <button onClick={() => onPreview(template)}>Xem trước</button>
            </div>
        ))}
        {templates.length === 0 && <div>Không có template nào</div>}
    </div>
)

export const TemplateForm = ({ template, onSave, onCancel }: any) => (
    <form onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        onSave({
            name: formData.get('name'),
            description: formData.get('description'),
            subject: formData.get('subject'),
            outputType: formData.get('outputType'),
            template: formData.get('template'),
        })
    }}>
        <label htmlFor="name">Tên template</label>
        <input id="name" name="name" defaultValue={template?.name} required />

        <label htmlFor="description">Mô tả</label>
        <textarea id="description" name="description" defaultValue={template?.description} required />

        <label htmlFor="subject">Môn học</label>
        <select id="subject" name="subject" defaultValue={template?.subject} required>
            <option value="Toán">Toán</option>
            <option value="Văn">Văn</option>
        </select>

        <label htmlFor="outputType">Loại đầu ra</label>
        <select id="outputType" name="outputType" defaultValue={template?.outputType} required>
            <option value="lesson-plan">lesson-plan</option>
        </select>

        <label htmlFor="template">Nội dung template</label>
        <textarea id="template" name="template" defaultValue={template?.template} required />

        <fieldset>
            <legend>Lớp</legend>
            <input type="checkbox" value="6" />
            <input type="checkbox" value="7" />
        </fieldset>

        <label htmlFor="tags">Tags</label>
        <input id="tags" name="tags" />

        <button type="button" onClick={() => { }}>Thêm biến</button>
        <input placeholder="Tên biến" />

        <button type="button" onClick={() => { }}>Thêm ví dụ</button>
        <input placeholder="Tiêu đề ví dụ" />

        <button type="submit">Lưu</button>
        <button type="button" onClick={onCancel}>Hủy</button>
    </form>
)