import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadActivitiesServer } from '@/lib/static-data';
import { getAllCities, getAllCategories, formatCategoryName } from '@/lib/data-processing';
import { generateCityCategoryMetadata } from '@/lib/metadata';
import Navigation from '@/app/components/Navigation';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Activities from '@/app/components/Activities';
import InternalLinksFooter from '@/app/components/InternalLinksFooter';

export async function generateStaticParams() {
  const activities = await loadActivitiesServer();
  const cities = getAllCities(activities);
  const categories = getAllCategories(activities);

  const params: Array<{ city: string; categorySlug: string }> = [];

  // Only generate combos that actually have activities
  cities.forEach((city) => {
    categories.forEach((category) => {
      const hasActivities = activities.some(
        (a) => a.citySlug === city.slug && a.categorySlugs.includes(category.slug)
      );

      if (hasActivities) {
        params.push({
          city: city.slug,
          categorySlug: category.slug,
        });
      }
    });
  });

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { city: string; categorySlug: string };
}): Promise<Metadata> {
  const activities = await loadActivitiesServer();
  const filtered = activities.filter(
    (a) => a.citySlug === params.city && a.categorySlugs.includes(params.categorySlug)
  );

  if (filtered.length === 0) {
    return {
      title: 'Not Found',
    };
  }

  const cityName = filtered[0].city;
  return generateCityCategoryMetadata(
    cityName,
    params.city,
    params.categorySlug,
    filtered
  );
}

export default async function CityCategoryPage({
  params,
}: {
  params: { city: string; categorySlug: string };
}) {
  const activities = await loadActivitiesServer();
  const filtered = activities.filter(
    (a) => a.citySlug === params.city && a.categorySlugs.includes(params.categorySlug)
  );

  if (filtered.length === 0) {
    notFound();
  }

  const cityName = filtered[0].city;
  const categoryName = formatCategoryName(params.categorySlug);

  // Convert to format expected by Activities component
  const formattedActivities = filtered.map((a) => ({
    id: a.id,
    activity: a.activity,
    localName: a.localName,
    description: a.description,
    location: a.location,
    duration: a.duration,
    tags: a.tags,
    rating: a.ratingNumber,
    image: a.image,
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: cityName, href: `/${params.city}` },
          { label: categoryName, href: `/${params.city}/category/${params.categorySlug}` },
        ]}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            {categoryName} in {cityName}
          </h1>
          <p className="text-xl text-primary-50">
            {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Activities activities={formattedActivities} />
      </div>

      {/* Internal Links Footer */}
      <InternalLinksFooter />

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-neutral-600">
                &copy; {new Date().getFullYear()} ThingsToDo.id
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Discover the best of Indonesia
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
