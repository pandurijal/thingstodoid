"use client";
import Link from "next/link";
import Activities from "./components/Activities";
import HeroSection from "./components/HeroSection";
import Sidebar from "./components/Sidebar";
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
    <div className="min-h-screen bg-white">
      {/* Simple Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              thingstodo<span className="text-sm text-neutral-500">.id</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-primary-600 font-medium">
                Browse Activities
              </Link>
              <Link href="/itinerary" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Plan Itinerary
              </Link>
              <Link href="/esim" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Travel eSIM
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection 
        activities={activities} 
        city={city || undefined}
      />

      {/* Main Content with Right Sidebar */}
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 max-w-none px-4 sm:px-6 lg:px-8 py-8">
          <Activities activities={activities} initialLocation={city || "all"} />
        </main>
        
        {/* Right Sidebar */}
        <Sidebar activities={activities} selectedLocation={city || undefined} />
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
