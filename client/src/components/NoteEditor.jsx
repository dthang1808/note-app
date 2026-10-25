import { useState } from 'react';
import Icon from './Icon.jsx';

export default function NoteEditor({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ title, content, pinned });
      onClose();
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="editor" onSubmit={submit}>
        <div className="editor__toolbar">
          <span>{note ? 'CHỈNH SỬA GHI CHÚ' : 'GHI CHÚ MỚI'}</span>
          <div className="editor__actions">
            <button className={`icon-button pin-toggle${pinned ? ' is-active' : ''}`} type="button" title={pinned ? 'Bỏ ghim' : 'Ghim ghi chú'} aria-label="Ghim ghi chú" onClick={() => setPinned(!pinned)}>
              <Icon name="pin" />
            </button>
            <button className="icon-button" type="button" aria-label="Đóng" onClick={onClose}><Icon name="close" /></button>
          </div>
        </div>
        <input
          className="editor__title"
          autoFocus
          maxLength={120}
          placeholder="Tiêu đề"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Tiêu đề ghi chú"
        />
        {saveError && <div className="error-banner" role="alert">{saveError}</div>}
        <textarea
          className="editor__content"
          maxLength={20000}
          placeholder="Bắt đầu viết điều bạn đang nghĩ..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          aria-label="Nội dung ghi chú"
        />
        <div className="editor__footer">
          <span>{content.length.toLocaleString('vi-VN')} / 20.000 ký tự</span>
          <button className="save-button" type="submit" disabled={saving || (!title.trim() && !content.trim())}>
            {saving ? 'Đang lưu...' : 'Lưu ghi chú'}
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
