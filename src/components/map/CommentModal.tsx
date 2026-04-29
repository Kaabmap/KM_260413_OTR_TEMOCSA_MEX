import { useState } from 'react';
import { useMapStore } from '@/store/mapStore';
import { useAuthStore } from '@/store/authStore';
import { X, MessageSquare } from 'lucide-react';

export function CommentModal() {
  const coord = useMapStore((s) => s.commentDraftCoord);
  const setCommentDraftCoord = useMapStore((s) => s.setCommentDraftCoord);
  const addComment = useMapStore((s) => s.addComment);
  const setPulseCommentId = useMapStore((s) => s.setPulseCommentId);
  const setActiveTool = useMapStore((s) => s.setActiveTool);
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState('');

  if (!coord) return null;

  const handleClose = () => {
    setText('');
    setCommentDraftCoord(null);
    setActiveTool('select');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !user) return;
    const newId = crypto.randomUUID();
    addComment({
      id: newId,
      userId: user.id,
      userName: user.name,
      coord,
      text: t,
      createdAt: new Date().toISOString(),
      resolved: false,
    });
    setPulseCommentId(newId);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-temocsa-gray-600 bg-temocsa-gray-800 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5 text-temocsa-red" />
            <h3 className="text-sm font-semibold">Comentario GeoBIM</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 hover:bg-temocsa-gray-700"
          >
            <X className="h-4 w-4 text-temocsa-gray-400" />
          </button>
        </div>
        <p className="mb-2 text-[11px] text-temocsa-gray-500">
          {coord[1].toFixed(5)}, {coord[0].toFixed(5)}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe la observación en obra…"
            rows={4}
            className="w-full resize-none rounded-lg border border-temocsa-gray-600 bg-temocsa-gray-900 px-3 py-2 text-sm text-white placeholder:text-temocsa-gray-500 focus:border-temocsa-red focus:outline-none"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-3 py-1.5 text-xs text-temocsa-gray-400 hover:bg-temocsa-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-temocsa-red px-4 py-1.5 text-xs font-medium text-white hover:bg-temocsa-red-dark"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
