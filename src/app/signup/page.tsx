'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Building2, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';

function SignupForm() {
    const { signUp } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [role, setRole] = useState<UserRole>((searchParams.get('role') as UserRole) || 'citizen');
    const [name, setName] = useState('');
    const [stationName, setStationName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error('Missing fields', { description: 'Please fill in all required fields.' });
            return;
        }
        if (password.length < 6) {
            toast.error('Weak password', { description: 'Password must be at least 6 characters.' });
            return;
        }
        if (role === 'police' && !stationName) {
            toast.error('Station name required', { description: 'Please enter the police station name.' });
            return;
        }
        setLoading(true);
        try {
            await signUp(email, password, name, role, role === 'police' ? stationName : undefined);
            toast.success('Account created', { description: 'Welcome to the platform!' });
            router.push(role === 'police' ? '/police' : '/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            toast.error('Signup failed', { description: message.includes('email-already') ? 'This email is already registered.' : message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700">
                    <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">Lost &amp; Found Platform</span>
            </Link>

            <Card className="w-full max-w-md shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Create Account</CardTitle>
                    <CardDescription>Register as a citizen or police station</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <button
                            type="button"
                            onClick={() => setRole('citizen')}
                            className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors ${role === 'citizen' ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <Users className="h-4 w-4" />
                            Citizen
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('police')}
                            className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors ${role === 'police' ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <Building2 className="h-4 w-4" />
                            Police Station
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">{role === 'police' ? 'Officer Name' : 'Full Name'}</Label>
                            <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        {role === 'police' && (
                            <div className="space-y-1.5">
                                <Label htmlFor="stationName">Police Station Name</Label>
                                <Input id="stationName" placeholder="e.g. MG Road Police Station" value={stationName} onChange={(e) => setStationName(e.target.value)} required />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
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
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-700 hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>}>
            <SignupForm />
        </Suspense>
    );
}
