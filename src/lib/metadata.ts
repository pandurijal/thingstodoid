import { Metadata } from 'next';
import { ParsedActivity } from '@/types/activity';
import { SITE_URL, SITE_NAME } from './constants';
import { getTopTags, formatCategoryName, generateSlug } from './data-processing';

/**
 * Generate metadata for city overview pages
 */
export function generateCityMetadata(
  cityName: string,
  citySlug: string,
  activities: ParsedActivity[]
): Metadata {
  const topTags = getTopTags(activities, 5);
  const tagString = topTags.join(', ');

  return {
    title: `Things to Do in ${cityName} - ${activities.length} Activities | ${SITE_NAME}`,
    description: `Discover ${activities.length} amazing things to do in ${cityName}, Indonesia. ${tagString} and more. Plan your perfect trip with local insights.`,
    keywords: [
      `${cityName} activities`,
      `things to do in ${cityName}`,
      `${cityName} tourism`,
      `${cityName} travel guide`,
      ...topTags.map(tag => `${tag} in ${cityName}`),
    ],
    alternates: {
      canonical: `${SITE_URL}/${citySlug}`,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/${citySlug}`,
      title: `Things to Do in ${cityName} - ${activities.length} Activities`,
      description: `Explore the best of ${cityName} with our curated guide to ${activities.length} activities and attractions.`,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/og-${citySlug}.jpg`,
          width: 1200,
          height: 630,
          alt: `${cityName} Travel Guide`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Things to Do in ${cityName} - ${activities.length} Activities`,
      description: `Discover the best activities in ${cityName}, Indonesia`,
    },
  };
}

/**
 * Generate metadata for category overview pages (all cities)
 */
export function generateCategoryMetadata(
  categorySlug: string,
  activities: ParsedActivity[]
): Metadata {
  const categoryName = formatCategoryName(categorySlug);
  const cities = Array.from(new Set(activities.map(a => a.city)));
  const citiesList = cities.slice(0, 3).join(', ');

  return {
    title: `${categoryName} in Indonesia - ${activities.length} Activities | ${SITE_NAME}`,
    description: `Explore ${activities.length} ${categoryName.toLowerCase()} across ${cities.length} cities in Indonesia. Available in ${citiesList} and more.`,
    keywords: [
      categoryName,
      `${categoryName} Indonesia`,
      ...cities.map(city => `${categoryName} ${city}`),
    ],
    alternates: {
      canonical: `${SITE_URL}/activities/${categorySlug}`,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/activities/${categorySlug}`,
      title: `${categoryName} in Indonesia - ${activities.length} Activities`,
      description: `Discover ${categoryName.toLowerCase()} across Indonesia's most popular destinations.`,
      siteName: SITE_NAME,
    },
  };
}

/**
 * Generate metadata for city + category combo pages
 */
export function generateCityCategoryMetadata(
  cityName: string,
  citySlug: string,
  categorySlug: string,
  activities: ParsedActivity[]
): Metadata {
  const categoryName = formatCategoryName(categorySlug);

  return {
    title: `${categoryName} in ${cityName} - ${activities.length} Activities | ${SITE_NAME}`,
    description: `Discover ${activities.length} ${categoryName.toLowerCase()} in ${cityName}, Indonesia. Find the perfect ${categoryName.toLowerCase().replace(' activities', '')} experience with detailed guides and tips.`,
    keywords: [
      `${categoryName} ${cityName}`,
      `${categoryName.replace(' Activities', '')} in ${cityName}`,
      `${cityName} ${categoryName.toLowerCase()}`,
    ],
    alternates: {
      canonical: `${SITE_URL}/${citySlug}/category/${categorySlug}`,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/${citySlug}/category/${categorySlug}`,
      title: `${categoryName} in ${cityName} - ${activities.length} Activities`,
      description: `Explore the best ${categoryName.toLowerCase()} in ${cityName}`,
      siteName: SITE_NAME,
    },
  };
}

/**
 * Generate metadata for individual activity pages
 */
export function generateActivityMetadata(activity: ParsedActivity): Metadata {
  const activitySlug = generateSlug(activity.activity);

  return {
    title: `${activity.activity} - ${activity.city} | ${SITE_NAME}`,
    description: activity.description || `Experience ${activity.activity} in ${activity.city}. ${activity.duration} | Rating: ${activity.ratingNumber}/5`,
    keywords: [
      activity.activity,
      activity.localName,
      activity.location,
      activity.city,
      ...activity.tagList,
    ],
    alternates: {
      canonical: `${SITE_URL}/${activity.citySlug}/${activitySlug}`,
    },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/${activity.citySlug}/${activitySlug}`,
      title: activity.activity,
      description: activity.description,
      siteName: SITE_NAME,
      images: activity.image === 'true' ? [
        {
          url: `${SITE_URL}/images/${activity.id}.jpg`,
          width: 1200,
          height: 675,
          alt: activity.activity,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: activity.activity,
      description: activity.description,
    },
  };
}
