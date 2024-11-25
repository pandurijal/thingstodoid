"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  MapPin,
  Clock,
  Tag,
  Loader2,
  ChevronDown,
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

type SelectOption = {
  value: string;
  label: string;
};

const ITEMS_PER_PAGE = 9;

const locationOptions: SelectOption[] = [
  { value: "all", label: "All Locations" },
  { value: "Bali", label: "Bali" },
  { value: "Jakarta", label: "Jakarta" },
  { value: "Yogyakarta", label: "Yogyakarta" },
  { value: "Lombok", label: "Lombok" },
  { value: "Surabaya", label: "Surabaya" },
];

const durationOptions: SelectOption[] = [
  { value: "all", label: "All Durations" },
  { value: "1-2 hours", label: "1-2 hours" },
  { value: "2-3 hours", label: "2-3 hours" },
  { value: "3-4 hours", label: "3-4 hours" },
  { value: "Full day", label: "Full day" },
  { value: "Multi-day", label: "Multi-day" },
];

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

const CustomSelect = ({
  options,
  value,
  onChange,
  className = "",
}: {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        className={`
          w-full px-4 py-2.5 text-left rounded-lg border border-gray-200 
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
          focus:ring-primary/20 flex items-center justify-between
          text-sm transition-colors duration-200
          ${isOpen ? "ring-2 ring-primary/20" : ""}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200
            ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-2">
            <input
              type="text"
              className="w-full px-3 py-1.5 text-sm rounded border border-gray-200 
                focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ul
            className="max-h-60 overflow-auto py-1"
            role="listbox"
            tabIndex={-1}
          >
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                className={`
                  px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                  ${
                    option.value === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
                onClick={() => handleOptionClick(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function Activities({ activities }: { activities: Activity[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(() => {
    // Initialize location from URL or default to "all"
    const cityFromUrl = searchParams.get("city");
    return cityFromUrl &&
      locationOptions.some((opt) => opt.value === cityFromUrl)
      ? cityFromUrl
      : "all";
  });
  const [duration, setDuration] = useState("all");
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>(
    []
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>(
    {}
  );
  const [isFiltering, setIsFiltering] = useState(false);

  // Handle location changes
  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (newLocation === "all") {
      params.delete("city");
    } else {
      params.set("city", newLocation);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle URL changes
  useEffect(() => {
    const cityFromUrl = searchParams.get("city");
    if (
      cityFromUrl &&
      locationOptions.some((opt) => opt.value === cityFromUrl)
    ) {
      setLocation(cityFromUrl);
    } else if (!cityFromUrl && location !== "all") {
      setLocation("all");
    }
  }, [searchParams, location]);

  const observer = useRef<IntersectionObserver>();
  const lastActivityElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    setIsFiltering(true);
    const timeoutId = setTimeout(() => {
      let filtered = activities;

      if (search) {
        filtered = filtered.filter(
          (act) =>
            act.activity.toLowerCase().includes(search.toLowerCase()) ||
            act.tags.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (location !== "all") {
        filtered = filtered.filter((act) => act.location.includes(location));
      }
      if (duration !== "all") {
        filtered = filtered.filter((act) => act.duration.includes(duration));
      }

      setFilteredActivities(filtered);
      setPage(1);
      setDisplayedActivities([]);
      setHasMore(true);
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, location, duration, activities]);

  useEffect(() => {
    if (isFiltering) return;

    setLoading(true);
    const timeoutId = setTimeout(() => {
      const startIndex = 0;
      const endIndex = page * ITEMS_PER_PAGE;

      const newActivities = filteredActivities.slice(startIndex, endIndex);
      setDisplayedActivities(newActivities);
      setHasMore(endIndex < filteredActivities.length);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, filteredActivities, isFiltering]);

  const handleImageError = (id: string) => {
    setImageLoadError((prev) => ({ ...prev, [id]: true }));
  };

  const ImageComponent = ({ activity }: { activity: Activity }) => {
    if (imageLoadError[activity.id] || !activity.image) {
      return (
        <div className="w-full h-full bg-gray-100 flex justify-center items-center">
          <p className="text-gray-400">No Image</p>
        </div>
      );
    }

    return (
      <Image
        src={`/images/${activity.id}.jpg`}
        alt={activity.activity}
        className="w-full h-full object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={75}
        width={500}
        height={500}
        loading="lazy"
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(500, 500))}`}
        onError={() => handleImageError(activity.id)}
      />
    );
  };

  const ActivityCard = ({
    activity,
    isLast,
  }: {
    activity: Activity;
    isLast: boolean;
  }) => (
    <div
      ref={isLast ? lastActivityElementRef : null}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="aspect-video bg-gray-100 relative">
        <ImageComponent activity={activity} />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          {activity.rating}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-primary">
          {activity.activity}
        </h3>
        <h4 className="text-gray-600 text-xs mb-4 line-clamp-2">
          {activity.localName}
        </h4>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {activity.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Tag className="w-4 h-4" />
            <div className="flex flex-wrap gap-1">
              {activity.tags
                .split(" ")
                .slice(0, 3)
                .map((tag) => (
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
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${activity.activity} ${activity.location}`
              )}`}
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
  );

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
          <CustomSelect
            options={locationOptions}
            value={location}
            onChange={handleLocationChange}
            className="w-full sm:w-auto min-w-[200px]"
          />
          <CustomSelect
            options={durationOptions}
            value={duration}
            onChange={setDuration}
            className="w-full sm:w-auto min-w-[200px]"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {displayedActivities.length} of {filteredActivities.length}{" "}
          activities
          {location !== "all" &&
            ` in ${
              locationOptions.find((opt) => opt.value === location)?.label
            }`}
        </p>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedActivities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isLast={index === displayedActivities.length - 1}
          />
        ))}
      </div>

      {/* Loading State */}
      {(loading || isFiltering) && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* No Results State */}
      {!loading && !isFiltering && displayedActivities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No activities found matching your criteria
          </p>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && displayedActivities.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No more activities to load</p>
        </div>
      )}
    </div>
  );
}
