import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadActivitiesServer } from '@/lib/static-data';
import { getAllCategories, formatCategoryName, groupByCity } from '@/lib/data-processing';
import { generateCategoryMetadata } from '@/lib/metadata';
import Navigation from '@/app/components/Navigation';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Activities from '@/app/components/Activities';
import InternalLinksFooter from '@/app/components/InternalLinksFooter';

export async function generateStaticParams() {
  const activities = await loadActivitiesServer();
  const categories = getAllCategories(activities);

  return categories.map((category) => ({
    categorySlug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { categorySlug: string };
}): Promise<Metadata> {
  const activities = await loadActivitiesServer();
  const categoryActivities = activities.filter((a) =>
    a.categorySlugs.includes(params.categorySlug)
  );

  if (categoryActivities.length === 0) {
    return {
      title: 'Category Not Found',
    };
  }

  return generateCategoryMetadata(params.categorySlug, categoryActivities);
}

export default async function CategoryPage({
  params,
}: {
  params: { categorySlug: string };
}) {
  const activities = await loadActivitiesServer();
  const categoryActivities = activities.filter((a) =>
    a.categorySlugs.includes(params.categorySlug)
  );

  if (categoryActivities.length === 0) {
    notFound();
  }

  const categoryName = formatCategoryName(params.categorySlug);
  const citiesWithActivities = groupByCity(categoryActivities);
  const cityCount = Object.keys(citiesWithActivities).length;

  // Convert to format expected by Activities component
  const formattedActivities = categoryActivities.map((a) => ({
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
          { label: categoryName, href: `/activities/${params.categorySlug}` },
        ]}
      />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{categoryName} in Indonesia</h1>
          <p className="text-xl text-primary-50">
            Explore {categoryActivities.length} activities across {cityCount} cities
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cities Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Available in {cityCount} Cities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(citiesWithActivities)
              .sort(([, a], [, b]) => b.length - a.length)
              .map(([city, acts]) => {
                const citySlug = acts[0].citySlug;
                return (
                  <Link
                    key={city}
                    href={`/${citySlug}/category/${params.categorySlug}`}
                    className="block p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-primary-300 transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {city}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {acts.length} {acts.length === 1 ? 'activity' : 'activities'}
                    </p>
                    <div className="mt-4 text-primary-600 text-sm font-medium flex items-center">
                      Explore {city}
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* All Activities */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            All {categoryName}
          </h2>
          <Activities activities={formattedActivities} />
        </section>
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
