"use client";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Star,
  Thermometer,
  CloudRain,
  Sun,
  Navigation
} from "lucide-react";

type Activity = {
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

type SidebarProps = {
  activities: Activity[];
  selectedLocation?: string;
};

const Sidebar = ({ activities, selectedLocation }: SidebarProps) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const travelTips = [
    "Best time to visit Indonesia is during dry season (April-October)",
    "Always carry cash - many places don't accept cards",
    "Learn basic Bahasa Indonesia phrases for better local interaction",
    "Respect local customs and dress modestly when visiting temples",
    "Try local street food but choose busy stalls for freshness",
    "Negotiate prices at markets but be respectful",
    "Book accommodations in advance during peak season"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % travelTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [travelTips.length]);

  const stats = {
    totalActivities: activities.length,
    locations: new Set(activities.map(a => a.location)).size,
    avgRating: activities.length > 0 
      ? (activities.reduce((sum, a) => sum + a.rating, 0) / activities.length).toFixed(1)
      : "0",
    topLocation: activities.length > 0 
      ? activities.reduce((acc, curr) => {
          acc[curr.location] = (acc[curr.location] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {}
  };

  const topLocationName = Object.keys(stats.topLocation).reduce((a, b) => 
    stats.topLocation[a] > stats.topLocation[b] ? a : b, ""
  );

  const popularTags = activities
    .flatMap(a => a.tags.split(" ").filter(tag => tag.startsWith("#")))
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTags = Object.entries(popularTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag);

  // Mock weather data
  const weatherData = {
    "Bali": { temp: 28, condition: "sunny", humidity: 75 },
    "Jakarta": { temp: 32, condition: "partly-cloudy", humidity: 80 },
    "Yogyakarta": { temp: 30, condition: "sunny", humidity: 70 },
    "Lombok": { temp: 29, condition: "sunny", humidity: 72 },
    "Surabaya": { temp: 31, condition: "partly-cloudy", humidity: 78 }
  };

  const currentWeather = selectedLocation && weatherData[selectedLocation as keyof typeof weatherData];

  return (
    <aside className="hidden lg:block w-80 bg-white border-l border-neutral-200 h-screen overflow-y-auto">
      <div className="p-6 space-y-6">
        
        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4">
          <h3 className="font-semibold text-primary-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-600">Total Activities</span>
              <span className="font-bold text-primary-800">{stats.totalActivities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-600">Locations</span>
              <span className="font-bold text-primary-800">{stats.locations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary-600">Avg Rating</span>
              <span className="font-bold text-primary-800 flex items-center gap-1">
                <Star className="w-3 h-3 text-accent-500 fill-accent-500" />
                {stats.avgRating}
              </span>
            </div>
            {topLocationName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-primary-600">Most Popular</span>
                <span className="font-bold text-primary-800">{topLocationName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Weather Widget */}
        {currentWeather && (
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-4">
            <h3 className="font-semibold text-secondary-800 mb-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Weather in {selectedLocation}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentWeather.condition === "sunny" ? (
                  <Sun className="w-8 h-8 text-accent-500" />
                ) : (
                  <CloudRain className="w-8 h-8 text-neutral-500" />
                )}
                <div>
                  <div className="text-2xl font-bold text-secondary-800">
                    {currentWeather.temp}°C
                  </div>
                  <div className="text-sm text-secondary-600 capitalize">
                    {currentWeather.condition.replace("-", " ")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-secondary-600">Humidity</div>
                <div className="font-semibold text-secondary-800">{currentWeather.humidity}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Travel Tips */}
        <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-4">
          <h3 className="font-semibold text-accent-800 mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Travel Tips
          </h3>
          <div className="min-h-[60px] flex items-center">
            <p className="text-sm text-accent-700 animate-fade-in">
              💡 {travelTips[currentTipIndex]}
            </p>
          </div>
          <div className="flex gap-1 mt-3">
            {travelTips.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentTipIndex ? "bg-accent-500 w-4" : "bg-accent-300 w-1"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-neutral-50 rounded-xl p-4">
          <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Popular Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                {tag.replace("#", "")}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-neutral-50 rounded-xl p-4">
          <h3 className="font-semibold text-neutral-800 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 transition-colors text-sm">
              🎯 Get Recommendations
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 transition-colors text-sm">
              📍 Plan My Route
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 transition-colors text-sm">
              ⭐ View Top Rated
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;