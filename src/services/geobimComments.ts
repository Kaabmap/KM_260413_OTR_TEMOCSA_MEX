import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase';
import type { GeoBIMComment } from '@/types';

const COLLECTION = 'geobim_comments';

function firestoreToComment(
  id: string,
  data: Record<string, unknown>
): GeoBIMComment | null {
  const userId = data.userId;
  const userName = data.userName;
  const text = data.text;
  const createdAt = data.createdAt;
  const resolved = data.resolved;
  const coord = data.coord;
  if (
    typeof userId !== 'string' ||
    typeof userName !== 'string' ||
    typeof text !== 'string' ||
    typeof createdAt !== 'string' ||
    typeof resolved !== 'boolean'
  ) {
    return null;
  }
  let lngLat: [number, number] | null = null;
  if (Array.isArray(coord) && coord.length === 2) {
    const a = Number(coord[0]);
    const b = Number(coord[1]);
    if (!Number.isNaN(a) && !Number.isNaN(b)) lngLat = [a, b];
  } else if (coord && typeof coord === 'object') {
    const o = coord as { lng?: unknown; lat?: unknown };
    const lng = Number(o.lng);
    const lat = Number(o.lat);
    if (!Number.isNaN(lng) && !Number.isNaN(lat)) lngLat = [lng, lat];
  }
  if (!lngLat) return null;
  const section =
    typeof data.section === 'string' ? data.section : undefined;
  return {
    id,
    userId,
    userName,
    coord: lngLat,
    text,
    createdAt,
    resolved,
    section,
  };
}

export function subscribeGeoBIMComments(
  onList: (comments: GeoBIMComment[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const list: GeoBIMComment[] = [];
    snap.forEach((d) => {
      const c = firestoreToComment(d.id, d.data() as Record<string, unknown>);
      if (c) list.push(c);
    });
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    onList(list);
  });
}

export async function createGeoBIMComment(comment: GeoBIMComment): Promise<void> {
  const db = getFirestoreDb();
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    throw new Error('No hay sesión de Firebase. Vuelve a iniciar sesión.');
  }
  // Las reglas exigen userId == request.auth.uid; siempre usar el UID de Auth.
  const payload: Record<string, unknown> = {
    userId: uid,
    userName: comment.userName,
    coord: comment.coord,
    text: comment.text,
    createdAt: comment.createdAt,
    resolved: false,
  };
  if (comment.section) {
    payload.section = comment.section;
  }
  await setDoc(doc(db, COLLECTION, comment.id), payload);
}

export async function resolveGeoBIMComment(commentId: string): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, COLLECTION, commentId), { resolved: true });
}
