'use client';

import { LostReport, FoundItem, Category } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Tag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface ReportCardProps {
    report: LostReport | FoundItem;
    type: 'lost' | 'found';
    matchCount?: number;
    href?: string;
}

const categoryColors: Record<Category, string> = {
    vehicle: 'bg-blue-100 text-blue-700',
    bag: 'bg-purple-100 text-purple-700',
    wallet: 'bg-yellow-100 text-yellow-700',
    electronics: 'bg-cyan-100 text-cyan-700',
    person: 'bg-red-100 text-red-700',
};

const categoryLabels: Record<Category, string> = {
    vehicle: 'Vehicle',
    bag: 'Bag / Luggage',
    wallet: 'Wallet / Docs',
    electronics: 'Electronics',
    person: 'Missing Person',
};

export function ReportCard({ report, type, matchCount, href }: ReportCardProps) {
    const location = type === 'lost'
        ? (report as LostReport).locationLost
        : (report as FoundItem).locationFound;
    const date = type === 'lost'
        ? (report as LostReport).dateLost
        : (report as FoundItem).dateFound;

    const content = (
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
            <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs font-medium ${categoryColors[report.category]} border-0`}>
                                {categoryLabels[report.category]}
                            </Badge>
                            <Badge variant={type === 'lost' ? 'destructive' : 'default'} className="text-xs">
                                {type === 'lost' ? 'Lost' : 'Found'}
                            </Badge>
                            {matchCount !== undefined && matchCount > 0 && (
                                <Badge className="text-xs bg-green-100 text-green-700 border-0">
                                    {matchCount} match{matchCount > 1 ? 'es' : ''}
                                </Badge>
                            )}
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-gray-900 truncate">{report.title}</h3>
                    </div>
                    {report.images && report.images.length > 0 && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={report.images[0]}
                            alt={report.title}
                            className="h-14 w-14 rounded-lg object-cover flex-shrink-0 border"
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {location}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {date ? format(new Date(date), 'dd MMM yyyy') : 'N/A'}
                    </span>
                    {report.aiStructuredData?.color && (
                        <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {report.aiStructuredData.color}
                        </span>
                    )}
                    {report.status === 'resolved' && (
                        <span className="flex items-center gap-1 text-green-600">
                            <AlertCircle className="h-3 w-3" />
                            Resolved
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full cursor-pointer">
                {content}
            </Link>
        );
    }
    return content;
}

