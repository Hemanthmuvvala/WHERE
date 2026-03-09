'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

type Step = 'form' | 'processing' | 'done';

export default function ReportFoundPage() {
    const { firebaseUser, appUser } = useAuth();
    const router = useRouter();


    const [step, setStep] = useState<Step>('form');
    const [category, setCategory] = useState<Category>('vehicle');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationFound, setLocationFound] = useState('');
    const [dateFound, setDateFound] = useState('');
    const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !locationFound || !dateFound) {
            toast.error('Missing fields', { description: 'Please fill all required fields.' });
            return;
        }
        setStep('processing');
        try {
            const res = await fetch('/api/reports/found', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    policeStationId: firebaseUser?.uid,
                    policeStationName: appUser?.stationName || appUser?.name,
                    policeEmail: firebaseUser?.email,
                    category,
                    title,
                    description,
                    locationFound,
                    dateFound,
                    images: [],
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');
            setAiResult(data.aiStructuredData);
            setStep('done');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed';
            toast.error('Submission failed', { description: message });
            setStep('form');
        }
    };

    if (step === 'processing') {
        return (
            <AuthGuard requiredRole="police">
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
                    <div className="text-center">
                        <p className="text-lg font-semibold">Processing with AI...</p>
                        <p className="text-sm text-gray-500">Structuring report and finding citizen matches</p>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    if (step === 'done') {
        return (
            <AuthGuard requiredRole="police">
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <div className="max-w-2xl mx-auto px-4 py-10">
                        <div className="text-center mb-6">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <h1 className="text-xl font-bold">Found Item Registered!</h1>
                            <p className="text-sm text-gray-500 mt-1">AI has processed the report and checked for citizen matches.</p>
                        </div>
                        {aiResult && (
                            <Card className="mb-6 border-blue-100">
                                <CardContent className="pt-4 pb-4">
                                    <p className="text-sm font-medium flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-blue-600" />
                                        AI Structured Data
                                    </p>
                                    <pre className="text-xs bg-gray-50 rounded p-3 overflow-auto text-gray-700 max-h-48">
                                        {JSON.stringify(aiResult, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button className="bg-blue-700 hover:bg-blue-800 flex-1" onClick={() => router.push('/police')}>
                                Go to Dashboard
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => { setStep('form'); setTitle(''); setDescription(''); }}>
                                Submit Another
                            </Button>
                        </div>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard requiredRole="police">
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/police">
                            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Report Found Item</h1>
                            <p className="text-xs text-gray-500">AI will match this with citizen lost reports automatically</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="border-gray-200">
                            <CardContent className="pt-5 pb-5 space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Category <span className="text-red-500">*</span></Label>
                                    <Select value={category} onValueChange={(v) => setCategory((v ?? 'vehicle') as Category)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="vehicle">Vehicle</SelectItem>
                                            <SelectItem value="bag">Bag / Luggage</SelectItem>
                                            <SelectItem value="wallet">Wallet / Documents</SelectItem>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                            <SelectItem value="person">Missing Person</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Title <span className="text-red-500">*</span></Label>
                                    <Input placeholder="Brief description of the item" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Description <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        placeholder="Detailed description: color, brand, model, unique features, contents..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Location Found <span className="text-red-500">*</span></Label>
                                        <Input placeholder="e.g. Station Road, MG Road" value={locationFound} onChange={(e) => setLocationFound(e.target.value)} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Date Found <span className="text-red-500">*</span></Label>
                                        <Input type="date" value={dateFound} onChange={(e) => setDateFound(e.target.value)} required max={new Date().toISOString().split('T')[0]} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button type="submit" className="flex-1 bg-blue-700 hover:bg-blue-800">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Register &amp; Run AI Matching
                            </Button>
                            <Link href="/police">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthGuard>
    );
}
