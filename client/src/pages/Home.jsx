import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import NoteCard from '../components/NoteCard.jsx';
import NoteEditor from '../components/NoteEditor.jsx';
import { notesApi } from '../services/api.js';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editorNote, setEditorNote] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    try {
      setNotes(await notesApi.getAll());
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
    const savedNote = editorNote
      ? await notesApi.update(editorNote.id, values)
      : await notesApi.create(values);
    setNotes((current) => editorNote
      ? current.map((note) => note.id === savedNote.id ? savedNote : note)
      : [savedNote, ...current]);
    setError('');
  }

  async function deleteNote(note) {
    if (!window.confirm(`Xóa ghi chú "${note.title}"?`)) return;
    try {
      await notesApi.remove(note.id);
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

      {editorOpen && <NoteEditor key={editorNote?.id ?? 'new'} note={editorNote} onClose={closeEditor} onSave={saveNote} />}
    </div>
  );
}
