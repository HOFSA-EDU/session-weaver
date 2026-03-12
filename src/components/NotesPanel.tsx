import { Note } from "@/lib/mock-data";
import { Plus, Globe, Lock, Pencil, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

interface NotesPanelProps {
  notes: Note[];
  currentUserId: string;
  isDM?: boolean;
  onAddNote?: (content: string, type: 'personal' | 'session') => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export function NotesPanel({ notes, currentUserId, isDM = false, onAddNote, onEditNote, onDeleteNote }: NotesPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<'personal' | 'session'>('session');
  const [filter, setFilter] = useState<'all' | 'session' | 'personal'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const visibleNotes = notes.filter(
    n => n.type === 'session' || n.authorId === currentUserId
  ).filter(
    n => filter === 'all' || n.type === filter
  );

  const handleSubmit = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim(), noteType);
      setNewNote("");
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editingId && editContent.trim() && onEditNote) {
      onEditNote(editingId, editContent.trim());
    }
    setEditingId(null);
    setEditContent("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const canEdit = (note: Note) => note.authorId === currentUserId && onEditNote;
  const canDelete = (note: Note) => {
    if (!onDeleteNote) return false;
    // Own notes can always be deleted; DM can delete any session note
    return note.authorId === currentUserId || (isDM && note.type === 'session');
  };

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes</h3>
        <div className="flex gap-1">
          {(['all', 'session', 'personal'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                filter === f ? 'bg-primary/20 text-primary' : 'bg-surface text-muted-foreground'
              }`}
            >
              {f === 'all' && 'All'}
              {f === 'session' && <><Globe className="w-2.5 h-2.5" /> Session</>}
              {f === 'personal' && <><Lock className="w-2.5 h-2.5" /> Personal</>}
            </button>
          ))}
        </div>
      </div>

      {/* Add note */}
      {onAddNote && (
        <div className="mb-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note..."
            className="w-full bg-surface rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1">
              <button
                onClick={() => setNoteType('session')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  noteType === 'session' ? 'bg-primary/20 text-primary' : 'bg-surface text-muted-foreground'
                }`}
              >
                <Globe className="w-3 h-3" /> Session
              </button>
              <button
                onClick={() => setNoteType('personal')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  noteType === 'personal' ? 'bg-primary/20 text-primary' : 'bg-surface text-muted-foreground'
                }`}
              >
                <Lock className="w-3 h-3" /> Personal
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!newNote.trim()}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium btn-press disabled:opacity-30"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {visibleNotes.map(note => (
          <div key={note.id} className="p-3 rounded-lg bg-surface group">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-medium text-muted-foreground">{note.authorName}</span>
              {note.type === 'personal' ? (
                <Lock className="w-2.5 h-2.5 text-muted-foreground" />
              ) : (
                <Globe className="w-2.5 h-2.5 text-muted-foreground" />
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {/* Action buttons */}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {canEdit(note) && editingId !== note.id && (
                  <button onClick={() => startEdit(note)} className="p-1 rounded card-hover btn-press">
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
                {canDelete(note) && editingId !== note.id && (
                  <button onClick={() => onDeleteNote!(note.id)} className="p-1 rounded card-hover btn-press">
                    <Trash2 className="w-3 h-3 text-crimson" />
                  </button>
                )}
              </div>
            </div>
            {editingId === note.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-background rounded-lg p-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-1 mt-1 justify-end">
                  <button onClick={cancelEdit} className="p-1 rounded card-hover btn-press">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={saveEdit} disabled={!editContent.trim()} className="p-1 rounded card-hover btn-press disabled:opacity-30">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/90 leading-relaxed">{note.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
