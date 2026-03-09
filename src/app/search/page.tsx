'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportCard } from '@/components/reports/ReportCard';
import { LostReport, FoundItem, Category, SearchResult } from '@/types';
import { Search, Loader2 } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<string>('');
    const [searchType, setSearchType] = useState<'lost' | 'found' | 'all'>('all');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    type: searchType,
                    filters: category ? { category: category as Category } : {},
                }),
            });
            const data = await res.json();
            setResults(data.results || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Search Items</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        AI-powered semantic search — describe what you&apos;re looking for in natural language.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Label className="sr-only">Search query</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search-query"
                                    placeholder="e.g. black iPhone 14, red Honda Activa KA01, brown wallet with Aadhar card..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="bg-blue-700 hover:bg-blue-800 shrink-0">
                            Search
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Category Filter</Label>
                            <Select value={category} onValueChange={(v: string | null) => setCategory(v ?? '')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All categories</SelectItem>
                                    <SelectItem value="vehicle">Vehicle</SelectItem>
                                    <SelectItem value="bag">Bag / Luggage</SelectItem>
                                    <SelectItem value="wallet">Wallet / Documents</SelectItem>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="person">Missing Person</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Report Type</Label>
                            <Select value={searchType} onValueChange={(v) => setSearchType(v as 'lost' | 'found' | 'all')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Reports</SelectItem>
                                    <SelectItem value="lost">Lost Reports Only</SelectItem>
                                    <SelectItem value="found">Found Items Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </form>

                {/* Results */}
                {loading && (
                    <div className="flex items-center justify-center py-16 gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
                        <span className="text-sm text-gray-500">Running semantic search...</span>
                    </div>
                )}

                {!loading && searched && results.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                        <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No results found for &quot;{query}&quot;</p>
                        <p className="text-xs text-gray-400 mt-1">Try different keywords or broaden your search</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">{results.length} result{results.length > 1 ? 's' : ''} found</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map(({ item, type, similarity }) => (
                                <div key={item.id} className="relative">
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="text-xs rounded-full bg-blue-700 text-white px-2 py-0.5 font-medium">
                                            {Math.round(similarity * 100)}% match
                                        </span>
                                    </div>
                                    <ReportCard
                                        report={item as LostReport | FoundItem}
                                        type={type as 'lost' | 'found'}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
