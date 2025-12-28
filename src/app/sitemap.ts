import { MetadataRoute } from 'next';
import { loadActivitiesServer } from '@/lib/static-data';
import { getAllCities, getAllCategories, generateSlug } from '@/lib/data-processing';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thingstodo.id';
  const activities = await loadActivitiesServer();
  const cities = getAllCities(activities);
  const categories = getAllCategories(activities);

  const sitemap: MetadataRoute.Sitemap = [];

  // Main pages
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  sitemap.push({
    url: `${baseUrl}/itinerary`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  sitemap.push({
    url: `${baseUrl}/esim`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  // City pages (clean URLs)
  cities.forEach((city) => {
    sitemap.push({
      url: `${baseUrl}/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  // Category pages (all cities combined)
  categories.forEach((category) => {
    sitemap.push({
      url: `${baseUrl}/activities/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // City + Category combination pages
  cities.forEach((city) => {
    categories.forEach((category) => {
      // Only add if there are activities for this combination
      const hasActivities = activities.some(
        (a) => a.citySlug === city.slug && a.categorySlugs.includes(category.slug)
      );

      if (hasActivities) {
        sitemap.push({
          url: `${baseUrl}/${city.slug}/category/${category.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  });

  // Individual activity pages - THIS IS THE CRITICAL PART THAT WAS MISSING!
  activities.forEach((activity) => {
    const activitySlug = generateSlug(activity.activity);
    sitemap.push({
      url: `${baseUrl}/${activity.citySlug}/${activitySlug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  return sitemap;
}
