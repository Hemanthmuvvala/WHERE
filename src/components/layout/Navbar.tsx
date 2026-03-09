'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Search, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const { appUser, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const dashboardHref = appUser?.role === 'police' ? '/police' : '/dashboard';

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-700">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-900 leading-tight">Lost &amp; Found</span>
                            <span className="block text-xs text-gray-500 leading-tight">Intelligence Platform</span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                        <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                            <Search className="h-4 w-4" />
                            Search
                        </Link>
                        {appUser ? (
                            <>
                                <Link href={dashboardHref}>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="max-w-[120px] truncate">{appUser.name}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${appUser.role === 'police' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {appUser.role === 'police' ? 'Police' : 'Citizen'}
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="outline" size="sm">Sign In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="bg-blue-700 hover:bg-blue-800">Register</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
                    <Link href="/search" className="block text-sm text-gray-700 py-1" onClick={() => setMobileOpen(false)}>
                        Search Items
                    </Link>
                    {appUser ? (
                        <>
                            <Link href={dashboardHref} className="block text-sm text-gray-700 py-1" onClick={() => setMobileOpen(false)}>
                                Dashboard
                            </Link>
                            <button onClick={handleSignOut} className="block text-sm text-red-600 py-1 w-full text-left">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="block text-sm text-gray-700 py-1" onClick={() => setMobileOpen(false)}>Sign In</Link>
                            <Link href="/signup" className="block text-sm text-blue-700 py-1" onClick={() => setMobileOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
