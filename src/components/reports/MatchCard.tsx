'use client';

import { Match } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ChevronRight } from 'lucide-react';

interface MatchCardProps {
    match: Match;
    perspective: 'citizen' | 'police';
}

export function MatchCard({ match, perspective }: MatchCardProps) {
    const scorePercent = Math.round(match.matchScore * 100);
    const matchColor =
        scorePercent >= 85 ? 'text-green-600 bg-green-50 border-green-200' :
            scorePercent >= 70 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                'text-orange-600 bg-orange-50 border-orange-200';

    const otherSide = perspective === 'citizen' ? match.foundItem : match.lostReport;
    const contactInfo = perspective === 'citizen'
        ? { label: 'Police Station', name: match.foundItem?.policeStationName, email: match.foundItem?.policeEmail, location: match.foundItem?.locationFound }
        : { label: 'Citizen', name: match.lostReport?.userName, email: match.lostReport?.userEmail, location: match.lostReport?.locationLost };

    return (
        <Card className={`border ${matchColor} transition-shadow hover:shadow-sm`}>
            <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${matchColor}`}>{scorePercent}%</span>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Match Score</p>
                            <Badge
                                variant="outline"
                                className={`text-xs ${match.status === 'confirmed' ? 'border-green-500 text-green-700' : match.status === 'rejected' ? 'border-red-400 text-red-600' : ''}`}
                            >
                                {match.status}
                            </Badge>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
                {otherSide && (
                    <div>
                        <p className="text-sm font-semibold text-gray-900">{otherSide.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{otherSide.description}</p>
                    </div>
                )}
                <div className="space-y-1">
                    {contactInfo.location && (
                        <p className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {contactInfo.location}
                        </p>
                    )}
                    {contactInfo.email && (
                        <p className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            {contactInfo.name} — {contactInfo.email}
                        </p>
                    )}
                </div>
                {contactInfo.email && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => window.open(`mailto:${contactInfo.email}?subject=Lost%20%26%20Found%20Match%20Inquiry`)}
                    >
                        Contact {contactInfo.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
