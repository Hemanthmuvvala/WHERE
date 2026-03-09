'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MatchCard } from '@/components/reports/MatchCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Match, LostReport } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getLostReportById } from '@/lib/firestore';

export default function MatchResultsPage() {
    const params = useParams();
    const reportId = params.reportId as string;
    const [matches, setMatches] = useState<Match[]>([]);
    const [report, setReport] = useState<LostReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [matchRes, reportData] = await Promise.all([
                    fetch(`/api/matches?lostReportId=${reportId}`).then((r) => r.json()),
                    getLostReportById(reportId),
                ]);
                setMatches(matchRes.matches || []);
                setReport(reportData);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reportId]);

    return (
        <AuthGuard requiredRole="citizen">
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Match Results</h1>
                            {report && <p className="text-sm text-gray-500">{report.title}</p>}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                            <p className="text-gray-500 text-sm">No matches found yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Matches are found automatically when police report recovered items.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 mb-4">{matches.length} potential match{matches.length > 1 ? 'es' : ''} found</p>
                            {/* Report summary */}
                            {report && (
                                <Card className="mb-6 border-gray-200">
                                    <CardHeader className="pb-2 pt-4 px-4">
                                        <CardTitle className="text-sm text-gray-700">Your Report</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-4">
                                        <p className="text-sm font-semibold">{report.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                                        {report.aiStructuredData && (
                                            <details className="mt-3">
                                                <summary className="text-xs text-blue-600 cursor-pointer">View AI structured data</summary>
                                                <pre className="text-xs bg-gray-50 rounded p-2 mt-2 overflow-auto max-h-32">
                                                    {JSON.stringify(report.aiStructuredData, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {matches.map((match) => (
                                    <MatchCard key={match.id} match={match} perspective="citizen" />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
