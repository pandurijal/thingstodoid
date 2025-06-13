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
  Filter,
  Grid3X3,
  List,
  ExternalLink,
  Heart,
  Share2,
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

const ITEMS_PER_PAGE = 12;

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
      <stop stop-color="#f8fafc" offset="0%" />
      <stop stop-color="#e2e8f0" offset="20%" />
      <stop stop-color="#f8fafc" offset="40%" />
      <stop stop-color="#f8fafc" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f8fafc" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

const AdBanner = ({ className = "", size = "banner" }: { className?: string; size?: "banner" | "square" | "rectangle" }) => {
  const dimensions = {
    banner: "h-24 md:h-32",
    square: "h-64 md:h-80",
    rectangle: "h-40 md:h-48"
  };

  return (
    <div className={`bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center ${dimensions[size]} ${className}`}>
      <div className="text-center">
        <div className="text-slate-400 text-sm font-medium">Advertisement</div>
        <div className="text-slate-300 text-xs mt-1">Your ad could be here</div>
      </div>
    </div>
  );
};

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
          w-full px-4 py-3 text-left rounded-xl border border-slate-200 
          bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 
          focus:ring-primary/20 focus:border-primary/30 flex items-center justify-between
          text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md
          ${isOpen ? "ring-2 ring-primary/20 border-primary/30 shadow-md" : ""}
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-slate-700">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-200
            ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl">
          <div className="p-3">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
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
                  px-4 py-3 text-sm cursor-pointer transition-colors duration-150
                  ${
                    option.value === value
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
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
              <li className="px-4 py-3 text-sm text-slate-500">
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
    const cityFromUrl = searchParams.get("city");
    return cityFromUrl &&
      locationOptions.some((opt) => opt.value === cityFromUrl)
      ? cityFromUrl
      : "all";
  });
  const [duration, setDuration] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    const params = new URLSearchParams(searchParams);
    if (newLocation === "all") {
      params.delete("city");
    } else {
      params.set("city", newLocation);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
            act.tags.toLowerCase().includes(search.toLowerCase()) ||
            act.location.toLowerCase().includes(search.toLowerCase())
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

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const shareActivity = async (activity: Activity) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.activity,
          text: activity.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const ImageComponent = ({ activity }: { activity: Activity }) => {
    if (imageLoadError[activity.id] || !activity.image) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center items-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">No Image</p>
          </div>
        </div>
      );
    }

    return (
      <Image
        src={`/images/${activity.id}.jpg`}
        alt={activity.activity}
        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
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
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200"
    >
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <ImageComponent activity={activity} />
        
        {/* Overlay with rating and actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-slate-700">{activity.rating}</span>
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => toggleFavorite(activity.id)}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  favorites.has(activity.id) 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-slate-600 hover:text-red-500'
                }`} 
              />
            </button>
            <button
              onClick={() => shareActivity(activity)}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <Share2 className="w-4 h-4 text-slate-600 hover:text-primary" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {activity.activity}
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            {activity.localName}
          </p>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {activity.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="bg-slate-100 p-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-slate-500" />
            </div>
            <span className="font-medium">{activity.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="bg-slate-100 p-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <span>{activity.duration}</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <div className="bg-slate-100 p-1.5 rounded-lg mt-0.5">
              <Tag className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activity.tags
                .split(" ")
                .slice(0, 3)
                .map((tag, index) => (
                  <span
                    key={index}
                    className="bg-slate-100 hover:bg-primary/10 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                  >
                    {tag.replace("#", "")}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${activity.activity} ${activity.location}`
            )}`}
            target="_blank"
            className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  const ActivityListItem = ({ activity }: { activity: Activity }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-100 p-4">
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
          <ImageComponent activity={activity} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1">
              {activity.activity}
            </h3>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {activity.rating}
            </div>
          </div>
          
          <p className="text-slate-600 text-sm line-clamp-2 mb-3">
            {activity.description}
          </p>
          
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {activity.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.duration}
            </span>
          </div>
          
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${activity.activity} ${activity.location}`
            )}`}
            target="_blank"
            className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            View Map
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Ad Banner */}
      <AdBanner className="mb-8" size="banner" />

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search activities, locations, or tags..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 text-slate-700 placeholder-slate-400 transition-all duration-200"
            />
          </div>

          {/* Filter Toggle for Mobile */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomSelect
                options={locationOptions}
                value={location}
                onChange={handleLocationChange}
              />
              <CustomSelect
                options={durationOptions}
                value={duration}
                onChange={setDuration}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 font-medium">
            <span className="text-slate-900 font-bold">{displayedActivities.length}</span> of{" "}
            <span className="text-slate-900 font-bold">{filteredActivities.length}</span> activities
            {location !== "all" && (
              <span className="text-primary font-semibold">
                {" "}in {locationOptions.find((opt) => opt.value === location)?.label}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Activity Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isLast={index === displayedActivities.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => (
            <div key={activity.id} ref={index === displayedActivities.length - 1 ? lastActivityElementRef : null}>
              <ActivityListItem activity={activity} />
            </div>
          ))}
        </div>
      )}

      {/* Mid-content Ad */}
      {displayedActivities.length > 6 && (
        <AdBanner size="rectangle" className="my-8" />
      )}

      {/* Loading State */}
      {(loading || isFiltering) && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Loading amazing activities...</p>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && !isFiltering && displayedActivities.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No activities found</h3>
          <p className="text-slate-500 mb-6">Try adjusting your search criteria or filters</p>
          <button
            onClick={() => {
              setSearch("");
              setLocation("all");
              setDuration("all");
            }}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && displayedActivities.length > 0 && (
        <div className="text-center py-12">
          <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <p className="text-slate-600 font-medium">You've seen all the amazing activities!</p>
          <p className="text-slate-500 text-sm mt-1">Check back later for new additions</p>
        </div>
      )}

      {/* Bottom Ad */}
      <AdBanner size="banner" className="mt-12" />
    </div>
  );
}