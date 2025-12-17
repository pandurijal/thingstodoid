// Raw activity data from CSV
export interface Activity {
  id: string;
  activity: string;
  localName: string;
  description: string;
  area: string;
  location: string;
  openingHours: string;
  duration: string;
  googleMapsLink: string;
  suitableFor: string;
  tags: string;
  rating: string;
  image: string;
  tips: string;
  notes: string;
  priceRange: string;
}

// Parsed activity with computed fields
export interface ParsedActivity extends Omit<Activity, 'rating'> {
  city: string;
  citySlug: string;
  tagList: string[];
  categorySlugs: string[];
  ratingNumber: number;
}

// City data structure
export interface CityData {
  name: string;
  slug: string;
  count: number;
}

// Category data structure
export interface CategoryData {
  name: string;
  slug: string;
  count: number;
}
