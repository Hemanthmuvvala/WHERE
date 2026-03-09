import { NextRequest, NextResponse } from 'next/server';
import { structureDescription, generateEmbedding } from '@/lib/gemini';
import { createLostReport, getAllFoundItems, createMatch, matchExists, getLostReportById, getLostReportsByUser } from '@/lib/firestore';
import { findMatches } from '@/lib/matching';
import { LostReport } from '@/types';

// Strip undefined/null values from an object so Firestore doesn't reject them
function cleanForFirestore(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
    );
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId, userEmail, userName, category, title, description,
            locationLost, dateLost, categoryFields
        } = body;

        if (!userId || !category || !title || !description || !locationLost || !dateLost) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // AI: Structure description and generate embedding (non-blocking on failure)
        let aiStructuredData: Record<string, unknown> = {};
        let embedding: number[] = [];
        try {
            aiStructuredData = await structureDescription(description, category);
            embedding = await generateEmbedding(`${title} ${description} ${category} ${locationLost}`);
        } catch (e) {
            console.error('AI processing failed (continuing without AI):', e);
        }

        // Clean category fields — remove any undefined values
        const cleanedCategoryFields = categoryFields
            ? cleanForFirestore(categoryFields as Record<string, unknown>)
            : {};

        const reportData: Omit<LostReport, 'id'> = {
            userId,
            userEmail: userEmail || '',
            userName: userName || '',
            category,
            title,
            description,
            locationLost,
            dateLost,
            images: [],           // No image storage
            categoryFields: cleanedCategoryFields,
            aiStructuredData,
            embedding,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const reportId = await createLostReport(reportData);

        // Trigger matching (best-effort — don't fail the whole request)
        try {
            const savedReport = await getLostReportById(reportId);
            if (savedReport && embedding.length > 0) {
                const foundItems = await getAllFoundItems();
                const matches = findMatches(savedReport, 'lost', foundItems);
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
            id: reportId,
            aiStructuredData,
            message: 'Report created successfully',
        });
    } catch (error) {
        console.error('Error creating lost report:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to save report: ${msg}` }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }
        const reports = await getLostReportsByUser(userId);
        return NextResponse.json({ reports });
    } catch (error) {
        console.error('Error fetching lost reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
