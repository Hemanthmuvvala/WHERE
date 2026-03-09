export type UserRole = 'citizen' | 'police';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  stationName?: string; // for police
  createdAt: string;
}

export type Category = 'vehicle' | 'bag' | 'wallet' | 'electronics' | 'person';

export interface AIStructuredData {
  category?: string;
  object_type?: string;
  brand?: string;
  model?: string;
  color?: string;
  unique_features?: string;
  location?: string;
  identifiers?: string;
  possible_keywords?: string[];
  name?: string; // for missing person
  age?: string;
  gender?: string;
}

export interface VehicleFields {
  vehicleNumber?: string;
  brand?: string;
  model?: string;
  color?: string;
}

export interface BagFields {
  bagType?: string;
  brand?: string;
  color?: string;
  itemsInside?: string;
}

export interface WalletFields {
  walletColor?: string;
  idCardsInside?: string;
  cardNames?: string;
}

export interface ElectronicsFields {
  deviceType?: string;
  brand?: string;
  model?: string;
}

export interface PersonFields {
  personName?: string;
  age?: string;
  gender?: string;
  lastSeenLocation?: string;
  clothingDescription?: string;
}

export type CategoryFields = VehicleFields | BagFields | WalletFields | ElectronicsFields | PersonFields;

export interface LostReport {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  category: Category;
  title: string;
  description: string;
  locationLost: string;
  dateLost: string;
  images: string[];
  categoryFields?: CategoryFields;
  aiStructuredData?: AIStructuredData;
  embedding?: number[];
  status: 'active' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface FoundItem {
  id: string;
  policeStationId: string;
  policeStationName?: string;
  policeEmail?: string;
  category: Category;
  title: string;
  description: string;
  locationFound: string;
  dateFound: string;
  images: string[];
  aiStructuredData?: AIStructuredData;
  embedding?: number[];
  status: 'available' | 'matched' | 'claimed';
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  lostReportId: string;
  foundItemId: string;
  matchScore: number;
  status: 'pending' | 'contacted' | 'confirmed' | 'rejected';
  createdAt: string;
  // Populated on fetch
  lostReport?: LostReport;
  foundItem?: FoundItem;
}

export interface SearchResult {
  item: LostReport | FoundItem;
  type: 'lost' | 'found';
  similarity: number;
}

export interface SearchFilters {
  category?: Category;
  color?: string;
  brand?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}
