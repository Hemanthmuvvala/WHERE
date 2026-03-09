'use client';

import { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryFieldsProps {
    category: Category;
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
}

export function CategoryFields({ category, values, onChange }: CategoryFieldsProps) {
    if (category === 'vehicle') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Vehicle Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Vehicle Number</Label>
                        <Input placeholder="e.g. KA01AB1234" value={values.vehicleNumber || ''} onChange={(e) => onChange('vehicleNumber', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input placeholder="e.g. Honda, Toyota" value={values.brand || ''} onChange={(e) => onChange('brand', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Model</Label>
                        <Input placeholder="e.g. Activa, Swift" value={values.model || ''} onChange={(e) => onChange('model', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Color</Label>
                        <Input placeholder="e.g. Red, Black" value={values.color || ''} onChange={(e) => onChange('color', e.target.value)} />
                    </div>
                </div>
            </div>
        );
    }

    if (category === 'bag') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bag / Luggage Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Bag Type</Label>
                        <Select value={values.bagType || ''} onValueChange={(v) => onChange('bagType', v ?? '')}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="backpack">Backpack</SelectItem>
                                <SelectItem value="handbag">Handbag</SelectItem>
                                <SelectItem value="suitcase">Suitcase</SelectItem>
                                <SelectItem value="trolley">Trolley Bag</SelectItem>
                                <SelectItem value="sling">Sling Bag</SelectItem>
                                <SelectItem value="laptop_bag">Laptop Bag</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input placeholder="e.g. Samsonite, VIP" value={values.brand || ''} onChange={(e) => onChange('brand', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Color</Label>
                        <Input placeholder="e.g. Black, Blue" value={values.color || ''} onChange={(e) => onChange('color', e.target.value)} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Items Inside</Label>
                        <Textarea placeholder="List important items inside the bag..." value={values.itemsInside || ''} onChange={(e) => onChange('itemsInside', e.target.value)} rows={2} />
                    </div>
                </div>
            </div>
        );
    }

    if (category === 'wallet') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Wallet / Document Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Wallet Color</Label>
                        <Input placeholder="e.g. Brown, Black" value={values.walletColor || ''} onChange={(e) => onChange('walletColor', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>ID Cards Inside</Label>
                        <Input placeholder="e.g. Aadhar, PAN, DL" value={values.idCardsInside || ''} onChange={(e) => onChange('idCardsInside', e.target.value)} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Card Names / Identifiers</Label>
                        <Textarea placeholder="List any card names or unique identifiers..." value={values.cardNames || ''} onChange={(e) => onChange('cardNames', e.target.value)} rows={2} />
                    </div>
                </div>
            </div>
        );
    }

    if (category === 'electronics') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Electronics Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Device Type</Label>
                        <Select value={values.deviceType || ''} onValueChange={(v) => onChange('deviceType', v ?? '')}>
                            <SelectTrigger><SelectValue placeholder="Select device" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="phone">Mobile Phone</SelectItem>
                                <SelectItem value="laptop">Laptop</SelectItem>
                                <SelectItem value="tablet">Tablet</SelectItem>
                                <SelectItem value="camera">Camera</SelectItem>
                                <SelectItem value="headphones">Headphones / Earbuds</SelectItem>
                                <SelectItem value="smartwatch">Smartwatch</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input placeholder="e.g. Apple, Samsung" value={values.brand || ''} onChange={(e) => onChange('brand', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Model</Label>
                        <Input placeholder="e.g. iPhone 14, Galaxy S23" value={values.model || ''} onChange={(e) => onChange('model', e.target.value)} />
                    </div>
                </div>
            </div>
        );
    }

    if (category === 'person') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Missing Person Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Full Name</Label>
                        <Input placeholder="Name of missing person" value={values.personName || ''} onChange={(e) => onChange('personName', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Age</Label>
                        <Input type="number" placeholder="Age" value={values.age || ''} onChange={(e) => onChange('age', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label>Gender</Label>
                        <Select value={values.gender || ''} onValueChange={(v) => onChange('gender', v ?? '')}>
                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Last Seen Location</Label>
                        <Input placeholder="Where was last seen" value={values.lastSeenLocation || ''} onChange={(e) => onChange('lastSeenLocation', e.target.value)} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Clothing Description</Label>
                        <Textarea placeholder="Describe what they were wearing..." value={values.clothingDescription || ''} onChange={(e) => onChange('clothingDescription', e.target.value)} rows={2} />
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
