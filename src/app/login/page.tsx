'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const { signIn, appUser } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Missing fields', { description: 'Please fill in all fields.' })
            return;
        }
        setLoading(true);
        try {
            const userCred = await signIn(email, password);
            // Read role directly from Firestore — appUser state may not have updated yet
            const { getDoc, doc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
            const role = userDoc.exists() ? userDoc.data().role : 'citizen';
            router.push(role === 'police' ? '/police' : '/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            toast.error('Login failed', { description: message.includes('invalid') || message.includes('credential') ? 'Invalid email or password.' : message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700">
                    <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                    <span className="text-sm font-bold text-gray-900">Lost &amp; Found Platform</span>
                </div>
            </Link>

            <Card className="w-full max-w-sm shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Sign In</CardTitle>
                    <CardDescription>Access your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-blue-700 hover:underline font-medium">
                            Register
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
