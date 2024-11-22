/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
// import Image from "next/image";
import Link from "next/link";
import { Search, Star, MapPin, Clock, Tag } from "lucide-react";

export default function Activities({ activities }: { activities: any[] }) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [duration, setDuration] = useState("all");
  const [filteredActivities, setFilteredActivities] = useState(activities);

  useEffect(() => {
    let filtered = activities;

    if (search)
      filtered = filtered.filter(
        (act) =>
          act.activity.toLowerCase().includes(search.toLowerCase()) ||
          act.tags.toLowerCase().includes(search.toLowerCase())
      );
    if (location !== "all")
      filtered = filtered.filter((act) => act.location.includes(location));
    if (duration !== "all")
      filtered = filtered.filter((act) => act.duration.includes(duration));

    setFilteredActivities(filtered);
  }, [search, location, duration]);

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search activities, locations, or tags..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="Bali">Bali</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Yogyakarta">Yogyakarta</option>
            <option value="Lombok">Lombok</option>
            <option value="Surabaya">Surabaya</option>
          </select>

          <select
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="all">All Durations</option>
            <option value="1-2 hours">1-2 hours</option>
            <option value="2-3 hours">2-3 hours</option>
            <option value="3-4 hours">3-4 hours</option>
            <option value="Full day">Full day</option>
            <option value="Multi-day">Multi-day</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredActivities.length} activities
        </p>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act: any) => (
          <div
            key={act.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="aspect-video bg-gray-100 relative">
              {/* {act.image && (
                <Image
                  src={`/images/${act.image}`}
                  alt={act.activity}
                  className="w-full h-full object-cover"
                  width={500}
                  height={500}
                  onError={(e) => {
                    // Replace broken image with fallback div
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.classList.add(
                      "fallback-image"
                    );
                  }}
                />
              )} */}
              <div 
                className={`w-full h-full bg-gray-100 flex justify-center items-center`}
                style={{ display: act.image ? 'none' : 'flex' }}
              >
                <p className="text-gray-400">No Image</p>
              </div>
              <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {act.rating}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg text-primary">
                {act.activity}
              </h3>
              <h4 className="text-gray-600 text-xs mb-4 line-clamp-2">
                {act.localName}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {act.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{act.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{act.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Tag className="w-4 h-4" />
                  <div className="flex flex-wrap gap-1">
                    {act.tags
                      .split(" ")
                      .slice(0, 3)
                      .map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          {tag.replace("#", "")}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${act.activity} ${act.location}`}
                    target="_blank"
                  >
                    <button className="bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-lg sm:mt-4 text-sm">
                      Go To <span className="font-bold">GMaps</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
