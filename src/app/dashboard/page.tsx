'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportCard } from '@/components/reports/ReportCard';
import { Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { LostReport } from '@/types';

export default function CitizenDashboard() {
    const { appUser, firebaseUser } = useAuth();
    const [reports, setReports] = useState<LostReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!firebaseUser) return;
        const fetchReports = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/reports/lost?userId=${firebaseUser.uid}`);
                const data = await res.json();
                setReports(data.reports || []);

                // Fetch match counts for each report
                const counts: Record<string, number> = {};
                await Promise.all(
                    (data.reports || []).map(async (r: LostReport) => {
                        const matchRes = await fetch(`/api/matches?lostReportId=${r.id}`);
                        const matchData = await matchRes.json();
                        counts[r.id] = matchData.matches?.length || 0;
                    })
                );
                setMatchCounts(counts);
            } catch (e) {
                console.error('Failed to fetch reports:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [firebaseUser]);

    const activeCount = reports.filter((r) => r.status === 'active').length;
    const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
    const totalMatches = Object.values(matchCounts).reduce((a, b) => a + b, 0);

    return (
        <AuthGuard requiredRole="citizen">
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {appUser?.name}</p>
                        </div>
                        <Link href="/dashboard/report">
                            <Button className="bg-blue-700 hover:bg-blue-800">
                                <Plus className="mr-2 h-4 w-4" />
                                Report Lost Item
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <Card className="border-gray-200">
                            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-600">Active Reports</CardTitle>
                                <Clock className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-3xl font-bold text-gray-900">{activeCount}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200">
                            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-600">Matches Found</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-3xl font-bold text-gray-900">{totalMatches}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200">
                            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
                                <FileText className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-3xl font-bold text-gray-900">{resolvedCount}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reports list */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Lost Reports</h2>
                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading reports...</div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm mb-4">No reports yet</p>
                                <Link href="/dashboard/report">
                                    <Button className="bg-blue-700 hover:bg-blue-800">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Submit First Report
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        type="lost"
                                        matchCount={matchCounts[report.id] || 0}
                                        href={`/dashboard/matches/${report.id}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {reports.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/dashboard/search">
                                <Button variant="outline" size="sm">Search Found Items</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
