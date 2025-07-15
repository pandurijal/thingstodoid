"use client";
import Link from "next/link";
import Activities from "./components/Activities";
import { useState, useEffect, Suspense } from "react";
import { parse } from "papaparse";
import { useSearchParams } from "next/navigation";

export type Activity = {
  id: string;
  activity: string;
  localName: string;
  description: string;
  location: string;
  duration: string;
  tags: string;
  rating: number;
  image?: string;
};


interface RawActivityData {
  id: string | undefined;
  activity: string | undefined;
  localName: string | undefined;
  description: string | undefined;
  location: string | undefined;
  duration: string | undefined;
  tags: string | undefined;
  rating: string | undefined;
  image?: string | undefined;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}


function HomeContent() {
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const city = searchParams.get('city');

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/activities.csv');
        const csvText = await response.text();
        const parsedData = parse(csvText, {
          header: true,
          transform: (value, field) => {
            if (field === "rating") {
              return parseFloat(value) || 0;
            }
            return value || "";
          },
        });

        const activitiesData = (parsedData.data as unknown[]).map((item: unknown) => {
          const rawItem = item as RawActivityData;
          return {
            id: String(rawItem.id || ""),
            activity: String(rawItem.activity || ""),
            localName: String(rawItem.localName || ""),
            description: String(rawItem.description || ""),
            location: String(rawItem.location || ""),
            duration: String(rawItem.duration || ""),
            tags: String(rawItem.tags || ""),
            rating: Number(rawItem.rating) || 0,
            image: rawItem.image ? String(rawItem.image) : undefined,
          };
        });

        // Sort by rating first to get top-rated items
        const sortedActivities = activitiesData.sort((a, b) => b.rating - a.rating);

        // Get top 30% of activities to maintain quality
        const topActivitiesCount = Math.ceil(sortedActivities.length * 0.3);
        const topActivities = sortedActivities.slice(0, topActivitiesCount);

        // Randomize only the top-rated activities
        setActivities(shuffleArray(topActivities));
      } catch (error) {
        console.error("Error loading activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  const locationOptions = Array.from(
    new Set(activities.map((activity) => activity.location))
  ).sort();
  const totalActivities = activities.length;
  const cityActivities = city
    ? activities.filter(
        (activity) => activity.location.toLowerCase() === city.toLowerCase()
      ).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-7xl mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              thingstodo<span className="text-sm text-gray-500">.id</span>
            </Link>
            <div className="text-sm text-gray-500">
              {totalActivities} activities in {locationOptions.length} locations
            </div>
          </div>
        </div>
      </nav>

      <main className="w-7xl mx-8 px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {city ? (
              <>
                Best things to do in{" "}
                <span className="text-primary underline decoration-wavy decoration-primary/30">
                  {city}
                </span>
                {cityActivities > 0 && (
                  <span className="block text-lg text-gray-600 mt-2">
                    {cityActivities} amazing activities to discover
                  </span>
                )}
              </>
            ) : (
              <>
                Find the best{" "}
                <span className="text-primary underline decoration-wavy decoration-primary/30">
                  things to do
                </span>{" "}
                in Indonesia
              </>
            )}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {city
              ? `Discover amazing activities, cultural experiences, and hidden gems in ${city}`
              : "Discover amazing activities, cultural experiences, and hidden gems across the Indonesian archipelago"}
          </p>
        </div>

        <Activities activities={activities} />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="w-7xl mx-8 px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} ThingsToDo.id
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Discover the best of Indonesia
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
