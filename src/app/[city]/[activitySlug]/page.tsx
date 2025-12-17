import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, Calendar, Users, Tag } from 'lucide-react';
import { loadActivitiesServer } from '@/lib/static-data';
import { generateSlug } from '@/lib/data-processing';
import { generateActivityMetadata } from '@/lib/metadata';
import Navigation from '@/app/components/Navigation';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import JsonLd from '@/app/components/JsonLd';

export async function generateStaticParams() {
  const activities = await loadActivitiesServer();

  return activities.map((activity) => ({
    city: activity.citySlug,
    activitySlug: generateSlug(activity.activity),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { city: string; activitySlug: string };
}): Promise<Metadata> {
  const activities = await loadActivitiesServer();
  const activity = activities.find(
    (a) => a.citySlug === params.city && generateSlug(a.activity) === params.activitySlug
  );

  if (!activity) {
    return {
      title: 'Activity Not Found',
    };
  }

  return generateActivityMetadata(activity);
}

export default async function ActivityPage({
  params,
}: {
  params: { city: string; activitySlug: string };
}) {
  const activities = await loadActivitiesServer();
  const activity = activities.find(
    (a) => a.citySlug === params.city && generateSlug(a.activity) === params.activitySlug
  );

  if (!activity) {
    notFound();
  }

  // Find related activities (same city OR shared tags)
  const relatedActivities = activities
    .filter((a) => {
      if (a.id === activity.id) return false;
      const sameCity = a.citySlug === activity.citySlug;
      const sharedTags = a.tagList.some((tag) => activity.tagList.includes(tag));
      return sameCity || sharedTags;
    })
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd type="activity" data={activity} />
      <Navigation />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: activity.city, href: `/${activity.citySlug}` },
          { label: activity.activity, href: `/${activity.citySlug}/${params.activitySlug}` },
        ]}
      />

      <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        {activity.image === 'true' ? (
          <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden mb-8">
            <Image
              src={`/images/${activity.id}.jpg`}
              alt={activity.activity}
              width={1200}
              height={675}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-8">
            <p className="text-primary-400 text-2xl">No image available</p>
          </div>
        )}

        {/* Title & Rating */}
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">{activity.activity}</h1>
        <h2 className="text-xl text-neutral-600 mb-4">{activity.localName}</h2>

        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-accent-500 text-accent-500" />
            <span className="text-lg font-semibold">{activity.ratingNumber}/5</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="w-5 h-5 text-primary-500" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Clock className="w-5 h-5 text-secondary-500" />
            <span>{activity.duration}</span>
          </div>
        </div>

        {/* Description */}
        <div className="prose prose-lg max-w-none mb-8">
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">About This Activity</h3>
          <p className="text-lg text-neutral-700 leading-relaxed">{activity.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold text-lg mb-4 text-neutral-900">
              Essential Information
            </h3>
            <dl className="space-y-3">
              {activity.openingHours && (
                <div>
                  <dt className="text-sm text-neutral-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Opening Hours
                  </dt>
                  <dd className="text-neutral-900 mt-1">{activity.openingHours}</dd>
                </div>
              )}
              {activity.priceRange && (
                <div>
                  <dt className="text-sm text-neutral-600">Price Range</dt>
                  <dd className="text-neutral-900 mt-1">{activity.priceRange}</dd>
                </div>
              )}
              {activity.suitableFor && (
                <div>
                  <dt className="text-sm text-neutral-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Suitable For
                  </dt>
                  <dd className="text-neutral-900 mt-1">{activity.suitableFor}</dd>
                </div>
              )}
            </dl>
          </div>

          {activity.tips && (
            <div className="bg-primary-50 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-4 text-neutral-900">Tips & Notes</h3>
              <p className="text-neutral-700">{activity.tips}</p>
              {activity.notes && (
                <p className="text-neutral-600 text-sm mt-3 italic">{activity.notes}</p>
              )}
            </div>
          )}
        </div>

        {/* Categories/Tags */}
        {activity.tagList.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-neutral-900 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {activity.tagList.slice(0, 10).map((tag) => (
                <Link
                  key={tag}
                  href={`/activities/${tag}-activities`}
                  className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {tag.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-12 pb-12 border-b border-neutral-200">
          {activity.googleMapsLink && (
            <Link
              href={activity.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              View on Google Maps
            </Link>
          )}
          <Link
            href="/itinerary"
            className="px-6 py-3 border border-primary-600 hover:bg-primary-50 text-primary-600 rounded-xl text-sm font-medium transition-colors"
          >
            Add to Itinerary
          </Link>
        </div>

        {/* Related Activities */}
        {relatedActivities.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedActivities.map((related) => (
                <Link
                  key={related.id}
                  href={`/${related.citySlug}/${generateSlug(related.activity)}`}
                  className="block group"
                >
                  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    {related.image === 'true' ? (
                      <div className="aspect-video bg-gray-200 relative overflow-hidden">
                        <Image
                          src={`/images/${related.id}.jpg`}
                          alt={related.activity}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200" />
                    )}
                    <div className="p-4">
                      <h4 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {related.activity}
                      </h4>
                      <p className="text-sm text-neutral-600 mt-1">{related.location}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-accent-500 text-accent-500" />
                        <span className="text-sm font-medium">{related.ratingNumber}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

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
