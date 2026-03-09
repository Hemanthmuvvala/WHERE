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

    // 1. Direct hard-match for vehicle number (highest priority)
    if (lostReport.category === 'vehicle' && foundItem.category === 'vehicle') {
        const lostNum = ((lostReport.categoryFields as Record<string, any>)?.vehicleNumber as string)?.toLowerCase().replace(/\s/g, '');
        const foundNum = ((foundItem as Record<string, any>).categoryFields?.vehicleNumber as string)?.toLowerCase().replace(/\s/g, '');

        // Exact match on vehicle number gives instant 1.0 match score
        if (lostNum && foundNum && lostNum === foundNum) {
            return 1.0;
        }
    }

    // 2. Are embeddings missing? If so, we need to boost the other weights
    const hasEmbeddings = lostReport.embedding && foundItem.embedding &&
        lostReport.embedding.length > 0 && foundItem.embedding.length > 0;

    // Weight distribution:
    // With embeddings: Category (0.2) + Color (0.1) + Brand (0.1) + Embedding (0.6)
    // Without embeddings: Category (0.4) + Color (0.3) + Brand (0.3)
    const weights = hasEmbeddings ? { cat: 0.2, color: 0.1, brand: 0.1 } : { cat: 0.4, color: 0.3, brand: 0.3 };

    // Category match
    if (lostReport.category === foundItem.category) {
        score += weights.cat;
    }

    // Color match from AI structured data or category fields
    const lostColor = (lostReport.aiStructuredData?.color as string)?.toLowerCase() || ((lostReport.categoryFields as Record<string, any>)?.color as string)?.toLowerCase() || '';
    const foundColor = (foundItem.aiStructuredData?.color as string)?.toLowerCase() || ((foundItem as Record<string, any>).categoryFields?.color as string)?.toLowerCase() || '';
    if (lostColor && foundColor && (lostColor.includes(foundColor.split(' ')[0]) || foundColor.includes(lostColor.split(' ')[0]))) {
        score += weights.color;
    }

    // Brand/model match
    const lostBrand = (lostReport.aiStructuredData?.brand as string)?.toLowerCase() || ((lostReport.categoryFields as Record<string, any>)?.brand as string)?.toLowerCase() || '';
    const foundBrand = (foundItem.aiStructuredData?.brand as string)?.toLowerCase() || ((foundItem as Record<string, any>).categoryFields?.brand as string)?.toLowerCase() || '';
    if (lostBrand && foundBrand && (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
        score += weights.brand;
    }

    // Embedding similarity
    if (hasEmbeddings) {
        const embeddingSim = cosineSimilarity(lostReport.embedding!, foundItem.embedding!);
        // Only add if similarity is positive
        if (embeddingSim > 0) {
            score += embeddingSim * 0.6;
        }
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
