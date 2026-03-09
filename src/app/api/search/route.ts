import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/gemini';
import { getAllLostReports, getAllFoundItems } from '@/lib/firestore';
import { cosineSimilarity } from '@/lib/matching';
import { LostReport, FoundItem, SearchFilters } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, filters, type = 'lost' }: { query: string; filters?: SearchFilters; type?: string } = body;

        if (!query) {
            return NextResponse.json({ error: 'Search query required' }, { status: 400 });
        }

        // Generate embedding for the search query
        let queryEmbedding: number[] = [];
        try {
            queryEmbedding = await generateEmbedding(query);
        } catch (e) {
            console.error('Embedding generation failed:', e);
        }

        // Fetch all reports
        let reports: (LostReport | FoundItem)[] = [];
        if (type === 'lost') {
            reports = await getAllLostReports();
        } else if (type === 'found') {
            reports = await getAllFoundItems();
        } else {
            const [lost, found] = await Promise.all([getAllLostReports(), getAllFoundItems()]);
            reports = [...lost, ...found];
        }

        // Apply filters
        if (filters) {
            if (filters.category) {
                reports = reports.filter((r) => r.category === filters.category);
            }
            if (filters.color) {
                reports = reports.filter((r) =>
                    r.aiStructuredData?.color?.toLowerCase().includes(filters.color!.toLowerCase())
                );
            }
            if (filters.brand) {
                reports = reports.filter((r) =>
                    r.aiStructuredData?.brand?.toLowerCase().includes(filters.brand!.toLowerCase())
                );
            }
            if (filters.location) {
                const loc = filters.location.toLowerCase();
                reports = reports.filter((r) => {
                    const lostLoc = (r as LostReport).locationLost?.toLowerCase() || '';
                    const foundLoc = (r as FoundItem).locationFound?.toLowerCase() || '';
                    return lostLoc.includes(loc) || foundLoc.includes(loc);
                });
            }
        }

        // Semantic search using embeddings
        const scored = reports.map((report) => {
            let similarity = 0;
            if (queryEmbedding.length > 0 && report.embedding && report.embedding.length > 0) {
                similarity = cosineSimilarity(queryEmbedding, report.embedding);
            } else {
                // Fall back to keyword search
                const text = `${report.title} ${report.description}`.toLowerCase();
                const keywords = query.toLowerCase().split(' ');
                const matchCount = keywords.filter((kw) => text.includes(kw)).length;
                similarity = matchCount / keywords.length;
            }
            return { report, similarity, type: (report as LostReport).locationLost ? 'lost' : 'found' };
        });

        // Sort by similarity and return top results
        const results = scored
            .filter((s) => s.similarity > 0.1)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 20)
            .map((s) => ({
                item: s.report,
                type: s.type,
                similarity: s.similarity,
            }));

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
