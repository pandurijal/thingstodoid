// page.tsx
import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import { parse } from "papaparse";
import Activities from "./components/Activities";
import { Metadata } from "next";

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

// Add this interface above the getActivities function
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

    // Update the type assertion and validation
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

    return activities;
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

  return (
    <div className="min-h-screen w-full flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-7xl mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              thingstodo<span className="text-sm text-gray-500">.id</span>
            </Link>
            <div className="text-sm text-gray-500">
              {totalActivities} activities in {locationOptions.length} cities
            </div>
          </div>
        </div>
      </nav>

      <main className="w-7xl mx-8 px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Hero Section */}
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
