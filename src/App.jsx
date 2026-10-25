import { useEffect, useMemo, useState } from 'react';

const icons = {
  notes: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  pin: <><path d="m16 3 5 5-4 1-4 4-1 5-2-2-2 5-1-1 2-5-2-2 5-1 4-4z" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
};

function Icon({ name, size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(new Date(date));
}

function NoteCard({ note, onOpen, onDelete }) {
  return (
    <article className={`note-card${note.pinned ? ' note-card--pinned' : ''}`} onClick={() => onOpen(note)}>
      <div className="note-card__top">
        <span className="note-date">{formatDate(note.updatedAt)}</span>
        {note.pinned && <span className="pin-mark" aria-label="Đã ghim"><Icon name="pin" size={15} /></span>}
      </div>
      <h3>{note.title}</h3>
      <p>{note.content || 'Chưa có nội dung.'}</p>
      <div className="note-card__footer">
        <span>{note.content ? `${note.content.length} ký tự` : 'Ghi chú trống'}</span>
        <button
          className="icon-button delete-button"
          type="button"
          aria-label={`Xóa ${note.title}`}
          title="Xóa ghi chú"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(note);
          }}
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </article>
  );
}

function Editor({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ title, content, pinned });
      onClose();
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

export default function App() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editorNote, setEditorNote] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function request(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Không thể kết nối với máy chủ.');
    }
    return response.status === 204 ? null : response.json();
  }

  async function loadNotes() {
    try {
      setNotes(await request('/api/notes'));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    return notes.filter((note) => {
      const matchesQuery = !normalizedQuery || `${note.title} ${note.content}`.toLocaleLowerCase('vi').includes(normalizedQuery);
      return matchesQuery && (filter === 'all' || note.pinned);
    });
  }, [notes, query, filter]);

  async function saveNote(values) {
    try {
      const savedNote = await request(
        editorNote ? `/api/notes/${editorNote.id}` : '/api/notes',
        {
          method: editorNote ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      );
      setNotes((current) => editorNote
        ? current.map((note) => note.id === savedNote.id ? savedNote : note)
        : [savedNote, ...current]);
      setError('');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteNote(note) {
    if (!window.confirm(`Xóa ghi chú "${note.title}"?`)) return;
    try {
      await request(`/api/notes/${note.id}`, { method: 'DELETE' });
      setNotes((current) => current.filter((item) => item.id !== note.id));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function openEditor(note = null) {
    setEditorNote(note);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditorNote(null);
  }

  const pinnedCount = notes.filter((note) => note.pinned).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Note App trang chủ">
          <span className="brand__icon"><Icon name="notes" size={21} /></span>
          <span>paper<span className="brand__period">.</span></span>
        </a>
        <div className="sidebar__label">THƯ VIỆN</div>
        <nav className="nav-list" aria-label="Bộ lọc ghi chú">
          <button className={`nav-item${filter === 'all' ? ' is-selected' : ''}`} onClick={() => setFilter('all')}>
            <Icon name="grid" /><span>Tất cả ghi chú</span><span className="nav-count">{notes.length}</span>
          </button>
          <button className={`nav-item${filter === 'pinned' ? ' is-selected' : ''}`} onClick={() => setFilter('pinned')}>
            <Icon name="pin" /><span>Đã ghim</span><span className="nav-count">{pinnedCount}</span>
          </button>
        </nav>
        <div className="sidebar__bottom">
          <div className="sidebar__note">
            <span className="sidebar__spark">✳</span>
            <p>Đừng quên ghi lại những ý tưởng tuyệt vời của bạn.</p>
          </div>
          <span className="sidebar__credit">Gọn gàng trong từng ý tưởng.</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">Không gian của bạn <span>/</span> Ghi chú</div>
          <div className="topbar__avatar" aria-label="Tài khoản của bạn">M</div>
        </header>
        <section className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">THỨ CỦA BẠN, THEO CÁCH CỦA BẠN</div>
              <h1>{filter === 'pinned' ? 'Ghi chú đã ghim' : 'Ghi chú của bạn'}<span className="heading-period">.</span></h1>
              <p className="page-subtitle">Một góc nhỏ để lưu giữ những điều quan trọng.</p>
            </div>
            <button className="primary-button" onClick={() => openEditor()}>
              <Icon name="plus" size={18} /><span>Ghi chú mới</span>
            </button>
          </div>

          <div className="notes-toolbar">
            <div className="notes-count">{filter === 'pinned' ? 'ĐÃ GHIM' : 'TẤT CẢ'} <span>{visibleNotes.length.toString().padStart(2, '0')}</span></div>
            <label className="search-box">
              <Icon name="search" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm ghi chú..." aria-label="Tìm kiếm ghi chú" />
              {query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Xóa tìm kiếm"><Icon name="close" size={15} /></button>}
            </label>
          </div>

          {error && <div className="error-banner" role="alert">{error}</div>}

          {loading ? (
            <div className="empty-state"><span className="empty-state__icon">◌</span><h2>Đang tải ghi chú...</h2></div>
          ) : visibleNotes.length > 0 ? (
            <div className="notes-grid">
              {visibleNotes.map((note) => <NoteCard key={note.id} note={note} onOpen={openEditor} onDelete={deleteNote} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon"><Icon name={query ? 'search' : 'notes'} size={25} /></span>
              <h2>{query ? 'Không tìm thấy ghi chú' : filter === 'pinned' ? 'Chưa có ghi chú được ghim' : 'Bắt đầu với một ghi chú mới'}</h2>
              <p>{query ? 'Thử tìm bằng một từ khóa khác nhé.' : filter === 'pinned' ? 'Ghim những ghi chú quan trọng để tìm lại nhanh hơn.' : 'Ghi lại ý tưởng đầu tiên của bạn — không cần phải hoàn hảo.'}</p>
              {!query && filter === 'all' && <button className="text-button" onClick={() => openEditor()}><Icon name="plus" size={16} /> Tạo ghi chú đầu tiên</button>}
            </div>
          )}
          <footer className="page-footer">Được lưu gọn gàng, để tâm trí bạn thảnh thơi <span>✳</span></footer>
        </section>
      </main>

      {editorOpen && <Editor key={editorNote?.id ?? 'new'} note={editorNote} onClose={closeEditor} onSave={saveNote} />}
    </div>
  );
}
