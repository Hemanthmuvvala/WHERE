import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    updateDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { LostReport, FoundItem, Match, AppUser } from '@/types';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUserDoc(user: Omit<AppUser, 'createdAt'>): Promise<void> {
    await addDoc(collection(db, 'users'), {
        ...user,
        createdAt: Timestamp.now().toDate().toISOString(),
    });
}

export async function getUserByUid(uid: string): Promise<AppUser | null> {
    const q = query(collection(db, 'users'), where('id', '==', uid));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as AppUser;
}

// ─── Lost Reports ─────────────────────────────────────────────────────────────

export async function createLostReport(data: Omit<LostReport, 'id'>): Promise<string> {
    // JSON round-trip strips undefined values which Firestore rejects
    const cleanData = JSON.parse(JSON.stringify(data));
    const ref = await addDoc(collection(db, 'lost_reports'), cleanData);
    return ref.id;
}

export async function getLostReportById(id: string): Promise<LostReport | null> {
    const snap = await getDoc(doc(db, 'lost_reports', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as LostReport;
}

export async function getLostReportsByUser(userId: string): Promise<LostReport[]> {
    const q = query(
        collection(db, 'lost_reports'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LostReport));
}

export async function getAllLostReports(): Promise<LostReport[]> {
    const q = query(collection(db, 'lost_reports'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LostReport));
}

export async function updateLostReportStatus(
    id: string,
    status: LostReport['status']
): Promise<void> {
    await updateDoc(doc(db, 'lost_reports', id), {
        status,
        updatedAt: Timestamp.now().toDate().toISOString(),
    });
}

// ─── Found Items ──────────────────────────────────────────────────────────────

export async function createFoundItem(data: Omit<FoundItem, 'id'>): Promise<string> {
    // JSON round-trip strips undefined values which Firestore rejects
    const cleanData = JSON.parse(JSON.stringify(data));
    const ref = await addDoc(collection(db, 'found_items'), cleanData);
    return ref.id;
}

export async function getFoundItemById(id: string): Promise<FoundItem | null> {
    const snap = await getDoc(doc(db, 'found_items', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FoundItem;
}

export async function getFoundItemsByStation(stationId: string): Promise<FoundItem[]> {
    const q = query(
        collection(db, 'found_items'),
        where('policeStationId', '==', stationId),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoundItem));
}

export async function getAllFoundItems(): Promise<FoundItem[]> {
    const q = query(collection(db, 'found_items'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoundItem));
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(data: Omit<Match, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'matches'), {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
    });
    return ref.id;
}

export async function getMatchesForLostReport(lostReportId: string): Promise<Match[]> {
    const q = query(
        collection(db, 'matches'),
        where('lostReportId', '==', lostReportId),
        orderBy('matchScore', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
}

export async function getMatchesForFoundItem(foundItemId: string): Promise<Match[]> {
    const q = query(
        collection(db, 'matches'),
        where('foundItemId', '==', foundItemId),
        orderBy('matchScore', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
}

export async function getAllMatches(): Promise<Match[]> {
    const q = query(collection(db, 'matches'), orderBy('matchScore', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
}

export async function updateMatchStatus(id: string, status: Match['status']): Promise<void> {
    await updateDoc(doc(db, 'matches'), { status });
}

// ─── Duplicate match check ───────────────────────────────────────────────────

export async function matchExists(lostReportId: string, foundItemId: string): Promise<boolean> {
    const q = query(
        collection(db, 'matches'),
        where('lostReportId', '==', lostReportId),
        where('foundItemId', '==', foundItemId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
}
