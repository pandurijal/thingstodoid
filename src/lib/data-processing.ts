import { Activity, ParsedActivity, CityData, CategoryData } from '@/types/activity';
import { MIN_CATEGORY_ACTIVITIES } from './constants';

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Extract city name from location field
 * Examples: "Ubud, Bali" -> "Bali", "Central Jakarta" -> "Jakarta"
 */
export function extractCity(location: string): string {
  const parts = location.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }

  // Handle cases like "Central Jakarta", "North Jakarta"
  const cityNames = ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok', 'Surabaya', 'Bandung', 'Semarang', 'Palembang'];
  for (const city of cityNames) {
    if (location.includes(city)) {
      return city;
    }
  }

  return location.trim();
}

/**
 * Parse raw CSV activities into enriched ParsedActivity objects
 */
export function parseActivities(rawData: Activity[]): ParsedActivity[] {
  return rawData
    .filter(activity => activity.id && activity.activity) // Filter out empty rows
    .map(activity => {
      const city = extractCity(activity.location);
      const citySlug = generateSlug(city);

      // Parse tags: "#temple #cultural #sunset" -> ["temple", "cultural", "sunset"]
      const tagList = activity.tags
        .split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.substring(1).toLowerCase())
        .filter(tag => tag.length > 0);

      // Generate category slugs from tags: "temple" -> "temple-activities"
      const categorySlugs = tagList.map(tag => `${tag}-activities`);

      // Parse rating: "4.5/5" -> 4.5
      const ratingNumber = parseFloat(activity.rating) || 0;

      return {
        ...activity,
        city,
        citySlug,
        tagList,
        categorySlugs,
        ratingNumber,
      };
    });
}

/**
 * Get all unique cities with activity counts
 */
export function getAllCities(activities: ParsedActivity[]): CityData[] {
  const cityMap = new Map<string, { name: string; count: number }>();

  activities.forEach(activity => {
    const existing = cityMap.get(activity.citySlug);
    if (existing) {
      existing.count++;
    } else {
      cityMap.set(activity.citySlug, {
        name: activity.city,
        count: 1,
      });
    }
  });

  return Array.from(cityMap.entries())
    .map(([slug, data]) => ({
      slug,
      name: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all unique categories with activity counts (minimum threshold applied)
 */
export function getAllCategories(activities: ParsedActivity[]): CategoryData[] {
  const categoryMap = new Map<string, number>();

  activities.forEach(activity => {
    activity.categorySlugs.forEach(categorySlug => {
      categoryMap.set(categorySlug, (categoryMap.get(categorySlug) || 0) + 1);
    });
  });

  return Array.from(categoryMap.entries())
    .filter(([, count]) => count >= MIN_CATEGORY_ACTIVITIES)
    .map(([slug, count]) => ({
      slug,
      name: formatCategoryName(slug),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Format category slug to display name
 * "beach-activities" -> "Beach Activities"
 */
export function formatCategoryName(slug: string): string {
  return slug
    .replace(/-activities$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') + ' Activities';
}

/**
 * Get top N tags from activities (for metadata descriptions)
 */
export function getTopTags(activities: ParsedActivity[], limit: number): string[] {
  const tagCounts = new Map<string, number>();

  activities.forEach(activity => {
    activity.tagList.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Group activities by city
 */
export function groupByCity(activities: ParsedActivity[]): Record<string, ParsedActivity[]> {
  const grouped: Record<string, ParsedActivity[]> = {};

  activities.forEach(activity => {
    if (!grouped[activity.city]) {
      grouped[activity.city] = [];
    }
    grouped[activity.city].push(activity);
  });

  return grouped;
}
