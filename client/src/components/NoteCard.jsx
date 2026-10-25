import Icon from './Icon.jsx';

function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(new Date(date));
}

export default function NoteCard({ note, onOpen, onDelete }) {
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
