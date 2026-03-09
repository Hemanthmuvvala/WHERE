import { LostReport, FoundItem, Match } from '@/types';

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

export function computeMatchScore(lostReport: LostReport, foundItem: FoundItem): number {
    let score = 0;

    // Category match (weight 0.2)
    if (lostReport.category === foundItem.category) {
        score += 0.2;
    }

    // Color match from AI structured data (weight 0.1)
    const lostColor = lostReport.aiStructuredData?.color?.toLowerCase() || '';
    const foundColor = foundItem.aiStructuredData?.color?.toLowerCase() || '';
    if (lostColor && foundColor && lostColor.includes(foundColor.split(' ')[0])) {
        score += 0.1;
    }

    // Embedding similarity (weight 0.6)
    if (lostReport.embedding && foundItem.embedding &&
        lostReport.embedding.length > 0 && foundItem.embedding.length > 0) {
        const embeddingSim = cosineSimilarity(lostReport.embedding, foundItem.embedding);
        score += embeddingSim * 0.6;
    }

    // Brand/model match (weight 0.1)
    const lostBrand = lostReport.aiStructuredData?.brand?.toLowerCase() || '';
    const foundBrand = foundItem.aiStructuredData?.brand?.toLowerCase() || '';
    if (lostBrand && foundBrand && (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
        score += 0.1;
    }

    return Math.min(score, 1.0);
}

export const MATCH_THRESHOLD = 0.65;

export interface MatchResult {
    lostReportId: string;
    foundItemId: string;
    matchScore: number;
}

export function findMatches(
    newReport: LostReport | FoundItem,
    reportType: 'lost' | 'found',
    counterparts: (LostReport | FoundItem)[]
): MatchResult[] {
    const results: MatchResult[] = [];

    for (const counterpart of counterparts) {
        let score: number;
        let lostReportId: string;
        let foundItemId: string;

        if (reportType === 'lost') {
            const lost = newReport as LostReport;
            const found = counterpart as FoundItem;
            score = computeMatchScore(lost, found);
            lostReportId = lost.id;
            foundItemId = found.id;
        } else {
            const found = newReport as FoundItem;
            const lost = counterpart as LostReport;
            score = computeMatchScore(lost, found);
            lostReportId = lost.id;
            foundItemId = found.id;
        }

        if (score >= MATCH_THRESHOLD) {
            results.push({ lostReportId, foundItemId, matchScore: score });
        }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
}
