'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/types';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const { firebaseUser, appUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!firebaseUser) {
                router.push('/login');
                return;
            }
            if (requiredRole && appUser && appUser.role !== requiredRole) {
                router.push(appUser.role === 'police' ? '/police' : '/dashboard');
            }
        }
    }, [loading, firebaseUser, appUser, requiredRole, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            </div>
        );
    }

    if (!firebaseUser) return null;
    if (requiredRole && appUser && appUser.role !== requiredRole) return null;

    return <>{children}</>;
}
