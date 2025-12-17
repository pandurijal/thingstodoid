import fs from 'fs';
import path from 'path';
import { parse } from 'papaparse';
import { Activity, ParsedActivity } from '@/types/activity';
import { parseActivities } from './data-processing';

// Cache for build-time performance
let cachedActivities: ParsedActivity[] | null = null;

/**
 * Load and parse activities from CSV at build time (server-side only)
 * Uses fs.readFileSync which only works during Next.js build/server rendering
 */
export async function loadActivitiesServer(): Promise<ParsedActivity[]> {
  // Return cached data if available
  if (cachedActivities) {
    return cachedActivities;
  }

  try {
    const csvPath = path.join(process.cwd(), 'public', 'activities.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const { data } = parse<Activity>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => {
        // Return empty string for empty values
        if (!value || value.trim() === '') {
          return '';
        }
        return value.trim();
      },
    });

    // Parse and enrich activities
    cachedActivities = parseActivities(data);

    return cachedActivities;
  } catch (error) {
    console.error('Error loading activities:', error);
    throw new Error('Failed to load activities data');
  }
}

/**
 * Clear the cache (useful for development/testing)
 */
export function clearCache(): void {
  cachedActivities = null;
}
