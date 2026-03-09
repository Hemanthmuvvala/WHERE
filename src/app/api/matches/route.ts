import { NextRequest, NextResponse } from 'next/server';
import { getMatchesForLostReport, getMatchesForFoundItem, getAllMatches, getLostReportById, getFoundItemById } from '@/lib/firestore';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lostReportId = searchParams.get('lostReportId');
        const foundItemId = searchParams.get('foundItemId');

        let matches;

        if (lostReportId) {
            matches = await getMatchesForLostReport(lostReportId);
            // Populate found items
            const populated = await Promise.all(
                matches.map(async (m) => {
                    const foundItem = await getFoundItemById(m.foundItemId);
                    return { ...m, foundItem };
                })
            );
            return NextResponse.json({ matches: populated });
        }

        if (foundItemId) {
            matches = await getMatchesForFoundItem(foundItemId);
            const populated = await Promise.all(
                matches.map(async (m) => {
                    const lostReport = await getLostReportById(m.lostReportId);
                    return { ...m, lostReport };
                })
            );
            return NextResponse.json({ matches: populated });
        }

        // Get all matches with both sides populated
        matches = await getAllMatches();
        const populated = await Promise.all(
            matches.map(async (m) => {
                const [lostReport, foundItem] = await Promise.all([
                    getLostReportById(m.lostReportId),
                    getFoundItemById(m.foundItemId),
                ]);
                return { ...m, lostReport, foundItem };
            })
        );

        return NextResponse.json({ matches: populated });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
