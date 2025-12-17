'use client';

import { ParsedActivity } from '@/types/activity';

interface JsonLdCityProps {
  type: 'city';
  data: {
    city: string;
    activities: ParsedActivity[];
  };
}

interface JsonLdActivityProps {
  type: 'activity';
  data: ParsedActivity;
}

type JsonLdProps = JsonLdCityProps | JsonLdActivityProps;

export default function JsonLd({ type, data }: JsonLdProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let structuredData: any = {};

  if (type === 'city') {
    const { city, activities } = data as JsonLdCityProps['data'];

    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Things to Do in ${city}`,
      description: `Discover ${activities.length} amazing activities in ${city}, Indonesia`,
      numberOfItems: activities.length,
      itemListElement: activities.slice(0, 10).map((activity, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'TouristAttraction',
          name: activity.activity,
          description: activity.description,
          address: {
            '@type': 'PostalAddress',
            addressLocality: city,
            addressCountry: 'ID',
          },
          aggregateRating: activity.ratingNumber ? {
            '@type': 'AggregateRating',
            ratingValue: activity.ratingNumber,
            bestRating: '5',
          } : undefined,
        },
      })),
    };
  } else if (type === 'activity') {
    const activity = data as ParsedActivity;

    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: activity.activity,
      description: activity.description,
      image: activity.image === 'true' ? `https://thingstodo.id/images/${activity.id}.jpg` : undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: activity.area,
        addressLocality: activity.city,
        addressCountry: 'ID',
      },
      aggregateRating: activity.ratingNumber ? {
        '@type': 'AggregateRating',
        ratingValue: activity.ratingNumber,
        bestRating: '5',
      } : undefined,
      openingHoursSpecification: activity.openingHours ? {
        '@type': 'OpeningHoursSpecification',
        description: activity.openingHours,
      } : undefined,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
