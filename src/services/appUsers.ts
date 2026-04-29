import { collection, getDocs } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import type { User, UserRole } from '@/types';

function isUserRole(x: unknown): x is UserRole {
  return x === 'admin' || x === 'editor' || x === 'visor';
}

export async function fetchAppUsersFromFirestore(): Promise<User[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(collection(db, 'app_users'));
  const out: User[] = [];
  snap.forEach((d) => {
    const x = d.data();
    const email = x.email;
    const name = x.name;
    const role = x.role;
    if (
      typeof email === 'string' &&
      typeof name === 'string' &&
      isUserRole(role)
    ) {
      out.push({
        id: typeof x.firebaseUid === 'string' ? x.firebaseUid : d.id,
        email,
        name,
        role,
      });
    }
  });
  return out.sort((a, b) => a.email.localeCompare(b.email));
}
