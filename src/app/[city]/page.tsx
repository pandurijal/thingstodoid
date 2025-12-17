import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadActivitiesServer } from '@/lib/static-data';
import { getAllCities } from '@/lib/data-processing';
import { generateCityMetadata } from '@/lib/metadata';
import Navigation from '@/app/components/Navigation';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import JsonLd from '@/app/components/JsonLd';
import HeroSection from '@/app/components/HeroSection';
import Activities from '@/app/components/Activities';
import Sidebar from '@/app/components/Sidebar';

export async function generateStaticParams() {
  const activities = await loadActivitiesServer();
  const cities = getAllCities(activities);

  return cities.map((city) => ({
    city: city.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const activities = await loadActivitiesServer();
  const cityActivities = activities.filter((a) => a.citySlug === params.city);

  if (cityActivities.length === 0) {
    return {
      title: 'City Not Found',
    };
  }

  const cityName = cityActivities[0].city;
  return generateCityMetadata(cityName, params.city, cityActivities);
}

export default async function CityPage({
  params,
}: {
  params: { city: string };
}) {
  const activities = await loadActivitiesServer();
  const cityActivities = activities.filter((a) => a.citySlug === params.city);

  if (cityActivities.length === 0) {
    notFound();
  }

  const cityName = cityActivities[0].city;

  // Convert ParsedActivity to Activity format expected by components
  const formattedActivities = cityActivities.map((a) => ({
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
      <JsonLd type="city" data={{ city: cityName, activities: cityActivities }} />
      <Navigation />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: cityName, href: `/${params.city}` },
        ]}
      />

      <HeroSection activities={formattedActivities} city={cityName} />

      <div className="flex">
        <main className="flex-1 max-w-none px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Things to Do in {cityName}
            </h1>
            <p className="text-lg text-neutral-600">
              Discover {cityActivities.length} amazing activities and attractions
            </p>
          </div>

          <Activities activities={formattedActivities} initialLocation={cityName} />
        </main>

        <Sidebar activities={formattedActivities} selectedLocation={cityName} />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200">
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
