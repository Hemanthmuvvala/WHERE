import { NextRequest, NextResponse } from 'next/server';
import { structureDescription, generateEmbedding } from '@/lib/gemini';
import { createFoundItem, getAllLostReports, createMatch, matchExists, getFoundItemById, getFoundItemsByStation } from '@/lib/firestore';
import { findMatches } from '@/lib/matching';
import { FoundItem } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            policeStationId, policeStationName, policeEmail,
            category, title, description, locationFound, dateFound
        } = body;

        if (!policeStationId || !category || !title || !description || !locationFound || !dateFound) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // AI: Structure description and generate embedding (non-blocking on failure)
        let aiStructuredData: Record<string, unknown> = {};
        let embedding: number[] = [];
        try {
            aiStructuredData = await structureDescription(description, category);
            embedding = await generateEmbedding(`${title} ${description} ${category} ${locationFound}`);
        } catch (e) {
            console.error('AI processing failed (continuing without AI):', e);
        }

        const itemData: Omit<FoundItem, 'id'> = {
            policeStationId,
            policeStationName: policeStationName || '',
            policeEmail: policeEmail || '',
            category,
            title,
            description,
            locationFound,
            dateFound,
            images: [],       // No image storage
            aiStructuredData,
            embedding,
            status: 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const itemId = await createFoundItem(itemData);

        // Trigger matching (best-effort)
        try {
            const savedItem = await getFoundItemById(itemId);
            if (savedItem && embedding.length > 0) {
                const lostReports = await getAllLostReports();
                const activeLost = lostReports.filter((r) => r.status === 'active');
                const matches = findMatches(savedItem, 'found', activeLost);
                for (const m of matches) {
                    const exists = await matchExists(m.lostReportId, m.foundItemId);
                    if (!exists) {
                        await createMatch({ ...m, status: 'pending', createdAt: new Date().toISOString() });
                    }
                }
            }
        } catch (matchErr) {
            console.error('Matching failed (non-critical):', matchErr);
        }

        return NextResponse.json({
            id: itemId,
            aiStructuredData,
            message: 'Found item created successfully',
        });
    } catch (error) {
        console.error('Error creating found item:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to save item: ${msg}` }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const stationId = searchParams.get('stationId');
        if (stationId) {
            const items = await getFoundItemsByStation(stationId);
            return NextResponse.json({ items });
        }
        // Return all found items if no stationId provided
        const { getAllFoundItems } = await import('@/lib/firestore');
        const items = await getAllFoundItems();
        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching found items:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
