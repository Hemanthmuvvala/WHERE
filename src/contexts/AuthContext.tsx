'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    UserCredential,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AppUser, UserRole } from '@/types';

interface AuthContextType {
    firebaseUser: User | null;
    appUser: AppUser | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string, role: UserRole, stationName?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setAppUser(userDoc.data() as AppUser);
                }
            } else {
                setAppUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signUp = async (
        email: string,
        password: string,
        name: string,
        role: UserRole,
        stationName?: string
    ) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Build user object without undefined fields — Firestore rejects undefined values
        const newUser: AppUser = {
            id: cred.user.uid,
            name,
            email,
            role,
            createdAt: new Date().toISOString(),
            ...(stationName ? { stationName } : {}),
        };
        await setDoc(doc(db, 'users', cred.user.uid), newUser);
        setAppUser(newUser);
    };

    const signIn = async (email: string, password: string): Promise<UserCredential> => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setAppUser(null);
    };

    return (
        <AuthContext.Provider value={{ firebaseUser, appUser, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
