import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { LostReport, FoundItem, Match, AppUser } from '@/types';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUserByUid(uid: string): Promise<AppUser | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as AppUser;
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
    // Simple where query — no compound index needed
    const q = query(collection(db, 'lost_reports'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LostReport));
    // Sort client-side to avoid needing a composite Firestore index
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllLostReports(): Promise<LostReport[]> {
    const snap = await getDocs(collection(db, 'lost_reports'));
    const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LostReport));
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateLostReportStatus(
    id: string,
    status: LostReport['status']
): Promise<void> {
    await updateDoc(doc(db, 'lost_reports', id), {
        status,
        updatedAt: new Date().toISOString(),
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
    // Simple where query — no compound index needed
    const q = query(collection(db, 'found_items'), where('policeStationId', '==', stationId));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoundItem));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllFoundItems(): Promise<FoundItem[]> {
    const snap = await getDocs(collection(db, 'found_items'));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoundItem));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(data: Omit<Match, 'id'>): Promise<string> {
    const cleanData = JSON.parse(JSON.stringify(data));
    const ref = await addDoc(collection(db, 'matches'), cleanData);
    return ref.id;
}

export async function getMatchesForLostReport(lostReportId: string): Promise<Match[]> {
    const q = query(collection(db, 'matches'), where('lostReportId', '==', lostReportId));
    const snap = await getDocs(q);
    const matches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export async function getMatchesForFoundItem(foundItemId: string): Promise<Match[]> {
    const q = query(collection(db, 'matches'), where('foundItemId', '==', foundItemId));
    const snap = await getDocs(q);
    const matches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export async function getAllMatches(): Promise<Match[]> {
    const snap = await getDocs(collection(db, 'matches'));
    const matches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match));
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export async function matchExists(lostReportId: string, foundItemId: string): Promise<boolean> {
    const q = query(
        collection(db, 'matches'),
        where('lostReportId', '==', lostReportId),
        where('foundItemId', '==', foundItemId)
    );
    const snap = await getDocs(q);
    return !snap.empty;
}
