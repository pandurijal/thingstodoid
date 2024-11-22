/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import { parse } from "papaparse";

import Activities from "./components/Activities";

async function getActivities() {
  const filePath = path.join(process.cwd(), "db", "db.csv");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const data = parse(fileContent, { header: true }).data;
  return data;
}

export const metadata = {
  title: 'ThingsToDo.id - Find the Best Activities in Indonesia',
  description: 'Discover amazing activities, cultural experiences, and hidden gems across the Indonesian archipelago',
  keywords: ['Indonesia', 'travel', 'activities', 'tourism', 'cultural experiences', 'things to do'],
  openGraph: {
    title: 'ThingsToDo.id - Find the Best Activities in Indonesia',
    description: 'Discover amazing activities, cultural experiences, and hidden gems across the Indonesian archipelago',
    url: 'https://thingstodo.id',
    siteName: 'ThingsToDo.id',
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'ThingsToDo.id Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThingsToDo.id - Find the Best Activities in Indonesia',
    description: 'Discover amazing activities, cultural experiences, and hidden gems across the Indonesian archipelago',
    images: ['/og-image.jpg'], // Same image as OpenGraph
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://thingstodo.id',
    languages: {
      'en-US': 'https://thingstodo.id/en-US',
      'id-ID': 'https://thingstodo.id/id-ID',
    },
  },
};

export default async function Home() {
  const activities = await getActivities();

  console.log({ activities });

  return (
    <div className="min-h-screen w-full flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="w-7xl mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              thingstodo<span className="text-sm text-gray-500">.id</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="w-7xl mx-8 px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find the best{" "}
            <span className="text-primary underline decoration-wavy decoration-primary/30">
              things to do
            </span>{" "}
            in Indonesia
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing activities, cultural experiences, and hidden gems
            across the archipelago
          </p>
        </div>

        <Activities activities={activities} />
      </main>

      <footer className="flex justify-center items-center p-4">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} ThingsToDo.id
        </p>
      </footer>
    </div>
  );
}
