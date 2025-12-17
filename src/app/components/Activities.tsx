"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Star,
  MapPin,
  Clock,
  Tag,
  Loader2,
  ChevronDown,
  Sun,
  CloudRain,
  Users,
  Heart,
  Share2,
  Bookmark,
  Calendar,
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

// Helper to extract unique locations from activities
function getLocationOptions(activities: Activity[]): SelectOption[] {
  const uniqueLocations = new Set<string>();

  activities.forEach(activity => {
    // Extract city from location field (last part after comma, or the whole string)
    const parts = activity.location.split(',');
    const city = parts.length > 1 ? parts[parts.length - 1].trim() : activity.location.trim();
    uniqueLocations.add(city);
  });

  const locationArray = Array.from(uniqueLocations)
    .sort()
    .map(city => ({ value: city, label: city }));

  return [{ value: "all", label: "All Locations" }, ...locationArray];
}

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

// Enhanced activity type with additional dummy data
type EnhancedActivity = Activity & {
  priceRange: '$' | '$$' | '$$$' | 'Free';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bestTime: 'Morning' | 'Afternoon' | 'Evening' | 'All Day';
  crowdLevel: 'Low' | 'Medium' | 'High';
  weatherSuitable: 'Sunny' | 'Rainy' | 'Any';
  isBookmarked?: boolean;
};

// Function to enhance activities with dummy data
function enhanceActivities(activities: Activity[]): EnhancedActivity[] {
  const priceRanges: ('$' | '$$' | '$$$' | 'Free')[] = ['Free', '$', '$$', '$$$'];
  const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
  const bestTimes: ('Morning' | 'Afternoon' | 'Evening' | 'All Day')[] = ['Morning', 'Afternoon', 'Evening', 'All Day'];
  const crowdLevels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
  const weatherSuitable: ('Sunny' | 'Rainy' | 'Any')[] = ['Sunny', 'Rainy', 'Any'];

  return activities.map((activity, index) => ({
    ...activity,
    priceRange: priceRanges[index % priceRanges.length],
    difficulty: difficulties[index % difficulties.length],
    bestTime: bestTimes[index % bestTimes.length],
    crowdLevel: crowdLevels[index % crowdLevels.length],
    weatherSuitable: weatherSuitable[index % weatherSuitable.length],
    isBookmarked: Math.random() > 0.8, // 20% chance of being bookmarked
  }));
}

interface ActivitiesProps {
  activities: Activity[];
  initialLocation?: string; // Allow parent to set initial location
}

export default function Activities({ activities, initialLocation = "all" }: ActivitiesProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [enhancedActivities, setEnhancedActivities] = useState<EnhancedActivity[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);

  // Generate location options from activities
  useEffect(() => {
    setLocationOptions(getLocationOptions(activities));
  }, [activities]);

  // Enhance activities with dummy data
  useEffect(() => {
    setEnhancedActivities(enhanceActivities(activities));
  }, [activities]);

  const [location, setLocation] = useState(initialLocation);
  const [duration, setDuration] = useState("all");
  const [filteredActivities, setFilteredActivities] = useState<EnhancedActivity[]>([]);
  const [displayedActivities, setDisplayedActivities] = useState<EnhancedActivity[]>(
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

    // Navigate to city page instead of using query params
    if (newLocation === "all") {
      router.push("/");
    } else {
      // Convert city name to slug (lowercase)
      const citySlug = newLocation.toLowerCase();
      router.push(`/${citySlug}`);
    }
  };

  // Sync location with initialLocation prop and validate against available options
  useEffect(() => {
    if (locationOptions.length > 0) {
      // Check if initialLocation exists in options
      const isValid = locationOptions.some(opt => opt.value === initialLocation);
      if (isValid) {
        setLocation(initialLocation);
      } else {
        // If not found, default to "all"
        setLocation("all");
      }
    }
  }, [initialLocation, locationOptions]);

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
      let filtered = enhancedActivities;

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
  }, [search, location, duration, enhancedActivities]);

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
    activity: EnhancedActivity;
    isLast: boolean;
  }) => {
    const [isBookmarked, setIsBookmarked] = useState(activity.isBookmarked || false);
    
    const getPriceColor = (price: string) => {
      switch (price) {
        case 'Free': return 'text-secondary-600 bg-secondary-50';
        case '$': return 'text-accent-600 bg-accent-50';
        case '$$': return 'text-accent-700 bg-accent-100';
        case '$$$': return 'text-primary-600 bg-primary-50';
        default: return 'text-neutral-600 bg-neutral-50';
      }
    };

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'Easy': return 'text-secondary-700 bg-secondary-100';
        case 'Medium': return 'text-accent-700 bg-accent-100';
        case 'Hard': return 'text-primary-700 bg-primary-100';
        default: return 'text-neutral-700 bg-neutral-100';
      }
    };

    const getCrowdIcon = (level: string) => {
      const baseClasses = "w-4 h-4";
      switch (level) {
        case 'Low': return <Users className={`${baseClasses} text-secondary-600`} />;
        case 'Medium': return <Users className={`${baseClasses} text-accent-600`} />;
        case 'High': return <Users className={`${baseClasses} text-primary-600`} />;
        default: return <Users className={`${baseClasses} text-neutral-600`} />;
      }
    };

    const getWeatherIcon = (weather: string) => {
      switch (weather) {
        case 'Sunny': return <Sun className="w-4 h-4 text-accent-500" />;
        case 'Rainy': return <CloudRain className="w-4 h-4 text-neutral-500" />;
        default: return <Calendar className="w-4 h-4 text-neutral-500" />;
      }
    };

    return (
      <div
        ref={isLast ? lastActivityElementRef : null}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-neutral-100 hover:border-neutral-200"
      >
        <div className="aspect-video bg-neutral-100 relative overflow-hidden">
          <ImageComponent activity={activity} />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-primary-600 fill-primary-600' : 'text-neutral-600'}`} />
              </button>
              <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                <Share2 className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
            
            {/* Quick info overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceColor(activity.priceRange)}`}>
                  {activity.priceRange === 'Free' ? 'Free' : activity.priceRange}
                </span>
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-accent-500 fill-accent-500" />
                  <span className="text-xs font-medium text-neutral-800">{activity.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Static rating badge */}
          <div className="absolute top-3 right-3 group-hover:opacity-0 transition-opacity duration-300 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-white/50">
            <Star className="w-4 h-4 text-accent-500 fill-accent-500" />
            {activity.rating}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-700 transition-colors line-clamp-1">
              {activity.activity}
            </h3>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
              {activity.difficulty}
            </span>
          </div>
          
          <h4 className="text-neutral-600 text-sm mb-3 line-clamp-1 font-medium">
            {activity.localName}
          </h4>
          
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>

          {/* Enhanced info grid */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="truncate">{activity.location}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Clock className="w-4 h-4 text-secondary-500" />
                <span className="truncate">{activity.duration}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                {getCrowdIcon(activity.crowdLevel)}
                <span>{activity.crowdLevel} crowd</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                {getWeatherIcon(activity.weatherSuitable)}
                <span>{activity.bestTime}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Tag className="w-4 h-4 text-neutral-400" />
            <div className="flex flex-wrap gap-1">
              {activity.tags
                .split(" ")
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={tag}
                    className="bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-md text-xs text-neutral-700 transition-colors cursor-pointer"
                  >
                    {tag.replace("#", "")}
                  </span>
                ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${activity.activity} ${activity.location}`
              )}`}
              target="_blank"
              className="flex-1"
            >
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                View on Maps
              </button>
            </Link>
            <button className="px-3 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors duration-200">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search activities, locations, or tags..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <CustomSelect
                options={locationOptions}
                value={location}
                onChange={handleLocationChange}
                className="min-w-[180px]"
              />
              <CustomSelect
                options={durationOptions}
                value={duration}
                onChange={setDuration}
                className="min-w-[180px]"
              />
            </div>
            
            {/* Results Count */}
            <div className="text-sm text-neutral-600 bg-neutral-50 px-4 py-2 rounded-full">
              <span className="font-medium">{displayedActivities.length}</span> of{" "}
              <span className="font-medium">{filteredActivities.length}</span> activities
              {location !== "all" &&
                ` in ${
                  locationOptions.find((opt) => opt.value === location)?.label
                }`}
            </div>
          </div>
        </div>
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
        <div className="flex flex-col justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
          <p className="text-neutral-600">Loading amazing activities...</p>
        </div>
      )}

      {/* No Results State */}
      {!loading && !isFiltering && displayedActivities.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">No activities found</h3>
          <p className="text-neutral-600 mb-6">
            Try adjusting your filters or search terms to discover more activities
          </p>
          <button 
            onClick={() => {
              setLocation("all");
              setDuration("all");
              setSearch("");
            }}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && displayedActivities.length > 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto mb-3"></div>
          <p className="text-neutral-500">You&apos;ve seen all activities</p>
        </div>
      )}
    </div>
  );
}
