import type { User, GeoBIMComment } from '@/types';

/** Admin: todos. Editor: solo los suyos. Visor: ninguno. */
export function canUserDeleteComment(
  user: User | null,
  comment: GeoBIMComment
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'editor') return comment.userId === user.id;
  return false;
}
