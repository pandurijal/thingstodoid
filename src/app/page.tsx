import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import { parse } from "papaparse";
import Activities from "./components/Activities";
import { Metadata } from "next";
import { MapPin, Star, Clock, TrendingUp, Users, Award } from "lucide-react";

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

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
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

async function getActivities(): Promise<Activity[]> {
  try {
    const filePath = path.join(process.cwd(), "db", "db.csv");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const parsedData = parse(fileContent, {
      header: true,
      transform: (value, field) => {
        if (field === "rating") {
          return parseFloat(value) || 0;
        }
        return value || "";
      },
    });

    const activities = (parsedData.data as unknown[]).map((item: unknown) => {
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
    const sortedActivities = activities.sort((a, b) => b.rating - a.rating);

    // Get top 30% of activities to maintain quality
    const topActivitiesCount = Math.ceil(sortedActivities.length * 0.3);
    const topActivities = sortedActivities.slice(0, topActivitiesCount);

    // Randomize only the top-rated activities
    return shuffleArray(topActivities);
  } catch (error) {
    console.error("Error reading or parsing activities:", error);
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const city = searchParams.city as string;

  const baseTitle = "ThingsToDo.id - Find the Best Activities in Indonesia";
  const baseDescription =
    "Discover amazing activities, cultural experiences, and hidden gems across the Indonesian archipelago";

  const title = city
    ? `Things To Do in ${city} - Best Activities and Experiences`
    : baseTitle;

  const description = city
    ? `Discover the best activities, cultural experiences, and hidden gems in ${city}. Find top-rated things to do and plan your perfect trip.`
    : baseDescription;

  const canonicalPath = city ? `?city=${encodeURIComponent(city)}` : "";

  return {
    title,
    description,
    keywords: [
      "Indonesia",
      "travel",
      "activities",
      "tourism",
      "cultural experiences",
      "things to do",
      ...(city
        ? [`${city} activities`, `things to do in ${city}`, `${city} tourism`]
        : []),
    ],
    openGraph: {
      title,
      description,
      url: `https://thingstodo.id${canonicalPath}`,
      siteName: "ThingsToDo.id",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `ThingsToDo.id - ${city || "Indonesia"} Preview`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
      other: [
        {
          rel: "apple-touch-icon-precomposed",
          url: "/apple-touch-icon-precomposed.png",
        },
      ],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
    alternates: {
      canonical: `https://thingstodo.id${canonicalPath}`,
      languages: {
        "en-US": `https://thingstodo.id/en-US${canonicalPath}`,
        "id-ID": `https://thingstodo.id/id-ID${canonicalPath}`,
      },
    },
  };
}

const StatCard = ({ icon: Icon, value, label, color }: { 
  icon: any; 
  value: string | number; 
  label: string; 
  color: string;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-600 font-medium">{label}</div>
      </div>
    </div>
  </div>
);

export default async function Home({ searchParams }: Props) {
  const activities = await getActivities();
  const city = searchParams.city as string;

  const locationOptions = Array.from(
    new Set(activities.map((activity) => activity.location))
  ).sort();
  
  const totalActivities = activities.length;
  const cityActivities = city
    ? activities.filter(
        (activity) => activity.location.toLowerCase() === city.toLowerCase()
      ).length
    : 0;

  // Calculate stats
  const averageRating = activities.length > 0 
    ? (activities.reduce((sum, act) => sum + act.rating, 0) / activities.length).toFixed(1)
    : "0";
  
  const topRatedCount = activities.filter(act => act.rating >= 4.5).length;

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-900">thingstodo</span>
                <span className="text-sm text-slate-500 font-medium">.id</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{totalActivities} activities</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{locationOptions.length} locations</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {city ? (
                <>
                  Discover amazing things to do in{" "}
                  <span className="text-primary bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                    {city}
                  </span>
                  {cityActivities > 0 && (
                    <div className="text-lg md:text-xl text-slate-600 mt-4 font-medium">
                      {cityActivities} curated experiences waiting for you
                    </div>
                  )}
                </>
              ) : (
                <>
                  Find the best{" "}
                  <span className="text-primary bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                    things to do
                  </span>{" "}
                  in Indonesia
                </>
              )}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {city
                ? `Explore handpicked activities, cultural experiences, and hidden gems in ${city}. From traditional attractions to modern adventures.`
                : "Explore handpicked activities, cultural experiences, and hidden gems across the Indonesian archipelago. From traditional temples to modern adventures."}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <StatCard
              icon={Star}
              value={averageRating}
              label="Avg Rating"
              color="bg-amber-500"
            />
            <StatCard
              icon={Award}
              value={topRatedCount}
              label="Top Rated"
              color="bg-primary"
            />
            <StatCard
              icon={MapPin}
              value={locationOptions.length}
              label="Locations"
              color="bg-blue-500"
            />
            <StatCard
              icon={Users}
              value={`${totalActivities}+`}
              label="Activities"
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Activities Component */}
        <Activities activities={activities} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="bg-primary p-2 rounded-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900">thingstodo</span>
                  <span className="text-sm text-slate-500 font-medium">.id</span>
                </div>
              </Link>
              <p className="text-slate-600 mb-4 max-w-md">
                Your ultimate guide to discovering the best activities, cultural experiences, 
                and hidden gems across Indonesia. Plan your perfect adventure today.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>© {new Date().getFullYear()} ThingsToDo.id</span>
                <span>•</span>
                <span>Made with ❤️ for travelers</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Platform Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Activities</span>
                  <span className="font-semibold text-slate-900">{totalActivities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Locations</span>
                  <span className="font-semibold text-slate-900">{locationOptions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Avg Rating</span>
                  <span className="font-semibold text-slate-900">{averageRating}★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Top Rated</span>
                  <span className="font-semibold text-slate-900">{topRatedCount}</span>
                </div>
              </div>
            </div>

            {/* Popular Locations */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Popular Destinations</h3>
              <div className="space-y-2">
                {locationOptions.slice(0, 5).map((location) => (
                  <Link
                    key={location}
                    href={`/?city=${encodeURIComponent(location)}`}
                    className="block text-sm text-slate-600 hover:text-primary transition-colors"
                  >
                    {location}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}