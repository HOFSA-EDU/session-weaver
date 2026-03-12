import { Note } from "@/lib/mock-data";
import { Plus, Download, Globe, Lock } from "lucide-react";
import { useState } from "react";

interface NotesPanelProps {
  notes: Note[];
  currentUserId: string;
  onAddNote?: (content: string, type: 'personal' | 'session') => void;
}

export function NotesPanel({ notes, currentUserId, onAddNote }: NotesPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<'personal' | 'session'>('session');

  const visibleNotes = notes.filter(
    n => n.type === 'session' || n.authorId === currentUserId
  );

  const handleSubmit = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim(), noteType);
      setNewNote("");
    }
  };

  return (
    <div className="card-surface p-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notes</h3>

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
          <div key={note.id} className="p-3 rounded-lg bg-surface">
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
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
