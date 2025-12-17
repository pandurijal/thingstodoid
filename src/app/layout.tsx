import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "ThingsToDo.id - Discover the Best Activities in Indonesia",
    template: "%s | ThingsToDo.id"
  },
  description: "Discover amazing activities, plan your perfect itinerary, and stay connected with eSIM across Indonesia. From Bali to Jakarta, explore the best things to do with local insights and AI-powered recommendations.",
  keywords: ["Indonesia travel", "things to do", "Bali activities", "Jakarta attractions", "travel itinerary", "Indonesia eSIM", "travel planning", "Indonesian culture", "adventure travel", "tourism Indonesia"],
  authors: [{ name: "ThingsToDo.id" }],
  creator: "ThingsToDo.id",
  publisher: "ThingsToDo.id",
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
  alternates: {
    canonical: "https://thingstodo.id",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thingstodo.id",
    siteName: "ThingsToDo.id",
    title: "ThingsToDo.id - Discover the Best Activities in Indonesia",
    description: "Discover amazing activities, plan your perfect itinerary, and stay connected with eSIM across Indonesia. From Bali to Jakarta, explore the best things to do with local insights and AI-powered recommendations.",
    images: [
      {
        url: "https://thingstodo.id/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ThingsToDo.id - Indonesia Travel Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@thingstodoid",
    creator: "@thingstodoid",
    title: "ThingsToDo.id - Discover the Best Activities in Indonesia",
    description: "Discover amazing activities, plan your perfect itinerary, and stay connected with eSIM across Indonesia.",
    images: ["https://thingstodo.id/twitter-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
<script async src="https://umami-pr.up.railway.app/script.js" data-website-id="44e74969-57d4-45f2-af83-afceefa87fbc"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "ThingsToDo.id",
              "description": "Discover amazing activities, plan your perfect itinerary, and stay connected with eSIM across Indonesia.",
              "url": "https://thingstodo.id",
              "logo": "https://thingstodo.id/logo.png",
              "sameAs": [
                "https://twitter.com/thingstodoid"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "ID"
              },
              "areaServed": {
                "@type": "Country",
                "name": "Indonesia"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Indonesia Travel Activities",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "TouristTrip",
                      "name": "Bali Activities",
                      "description": "Explore temples, beaches, and cultural experiences in Bali"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "TouristTrip",
                      "name": "Jakarta Activities",
                      "description": "Discover urban attractions and cultural sites in Jakarta"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
