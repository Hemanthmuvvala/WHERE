'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportCard } from '@/components/reports/ReportCard';
import { MatchCard } from '@/components/reports/MatchCard';
import { Plus, Package, LinkIcon, Clock } from 'lucide-react';
import { FoundItem, Match } from '@/types';

export default function PoliceDashboard() {
    const { appUser, firebaseUser } = useAuth();
    const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firebaseUser) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [itemsRes, matchesRes] = await Promise.all([
                    fetch(`/api/reports/found?stationId=${firebaseUser.uid}`).then((r) => r.json()),
                    fetch('/api/matches').then((r) => r.json()),
                ]);
                setFoundItems(itemsRes.items || []);
                // Filter matches for items belonging to this station
                const stationItemIds = new Set((itemsRes.items || []).map((i: FoundItem) => i.id));
                setMatches((matchesRes.matches || []).filter((m: Match) => stationItemIds.has(m.foundItemId)));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [firebaseUser]);

    const pendingMatches = matches.filter((m) => m.status === 'pending');

    return (
        <AuthGuard requiredRole="police">
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Police Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {appUser?.stationName || appUser?.name}
                            </p>
                        </div>
                        <Link href="/police/report">
                            <Button className="bg-blue-700 hover:bg-blue-800">
                                <Plus className="mr-2 h-4 w-4" />
                                Report Found Item
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <Card className="border-gray-200">
                            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-600">Items Recovered</CardTitle>
                                <Package className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-3xl font-bold text-gray-900">{foundItems.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200">
                            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-600">Matches Found</CardTitle>
                                <LinkIcon className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-3xl font-bold text-gray-900">{matches.length}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-gray-200">
                            <CardHeader className="pb-2 pt-4 px-4 flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-gray-600">Pending Follow-up</CardTitle>
                                <Clock className="h-4 w-4 text-orange-400" />
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-3xl font-bold text-gray-900">{pendingMatches.length}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pending matches */}
                    {pendingMatches.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Matches (Contact Citizens)</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingMatches.slice(0, 6).map((match) => (
                                    <MatchCard key={match.id} match={match} perspective="police" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Found items */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recovered Items</h2>
                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading...</div>
                        ) : foundItems.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm mb-4">No items registered yet</p>
                                <Link href="/police/report">
                                    <Button className="bg-blue-700 hover:bg-blue-800">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Found Item
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {foundItems.map((item) => (
                                    <ReportCard key={item.id} report={item} type="found" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
