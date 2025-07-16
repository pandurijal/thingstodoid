"use client";
import { useState, useEffect } from "react";
import { MapPin, Calendar, Star, Users, Search, TrendingUp, ArrowRight } from "lucide-react";

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

type HeroSectionProps = {
  activities: Activity[];
  city?: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
};


const HeroSection = ({ activities, city }: HeroSectionProps) => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const locationOptions = Array.from(
    new Set(activities.map((activity) => activity.location))
  ).sort();
  
  const totalActivities = activities.length;
  const cityActivities = city
    ? activities.filter(
        (activity) => activity.location.toLowerCase() === city.toLowerCase()
      ).length
    : 0;

  const avgRating = activities.length > 0 
    ? (activities.reduce((sum, a) => sum + a.rating, 0) / activities.length)
    : 0;
    
  // Get top-rated activities for featured spotlight
  const featuredActivities = activities
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
    
  // Auto-rotate featured activities
  useEffect(() => {
    if (featuredActivities.length > 0) {
      const timer = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % featuredActivities.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [featuredActivities.length]);
  
  // Search suggestions
  const searchSuggestions = [
    "Temple visits in Bali",
    "Cultural experiences Jakarta", 
    "Nature activities Lombok",
    "Photography spots Yogyakarta",
    "Adventure tours Surabaya"
  ];
  
  const currentFeatured = featuredActivities[featuredIndex];

  const stats = [
    {
      icon: MapPin,
      label: "Activities",
      value: cityActivities > 0 ? cityActivities : totalActivities,
      suffix: "",
      color: "text-primary-600"
    },
    {
      icon: Calendar,
      label: "Locations",
      value: locationOptions.length,
      suffix: "",
      color: "text-secondary-600"
    },
    {
      icon: Star,
      label: "Avg Rating",
      value: avgRating,
      suffix: "/5",
      color: "text-accent-600",
      decimal: true
    },
    {
      icon: Users,
      label: "Experiences",
      value: Math.floor(totalActivities * 2.3), // Mock visitor count
      suffix: "k+",
      color: "text-neutral-600"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
      {/* Indonesian-inspired background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M60 60l30-30v60l-30-30zm0 0l-30-30v60l30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-accent-400/20 rounded-full animate-pulse" />
      <div className="absolute top-32 right-20 w-12 h-12 bg-secondary-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-accent-300/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Main content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {city ? (
                <>
                  Explore{" "}
                  <span className="text-accent-300 underline decoration-wavy decoration-accent-300/60">
                    {city}
                  </span>
                  <br />
                  <span className="text-2xl sm:text-3xl font-normal text-primary-100 block mt-2">
                    Like Never Before
                  </span>
                </>
              ) : (
                <>
                  Discover{" "}
                  <span className="text-accent-300 underline decoration-wavy decoration-accent-300/60">
                    Indonesia
                  </span>
                  <br />
                  <span className="text-2xl sm:text-3xl font-normal text-primary-100 block mt-2">
                    One Adventure at a Time
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-xl text-primary-100 mb-8 max-w-xl mx-auto lg:mx-0">
              {city
                ? `Uncover hidden gems and authentic experiences in ${city} with our curated collection of activities`
                : "From ancient temples to pristine beaches, discover the soul of the Indonesian archipelago through authentic local experiences"}
            </p>

            {/* Interactive Search */}
            <div className="relative mb-8 max-w-md mx-auto lg:mx-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-300" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="What do you want to explore?"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-all duration-300"
                />
              </div>
              
              {/* Search suggestions */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-10 animate-slide-up">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-neutral-700 text-sm transition-colors flex items-center gap-3"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setSearchFocused(false);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 text-neutral-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label} 
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className="w-6 h-6 mx-auto lg:mx-0 mb-2 text-accent-300" />
                    <div className="text-xl font-bold">
                      {stat.decimal ? avgRating.toFixed(1) : stat.value}
                      <span className="text-sm text-primary-200">{stat.suffix}</span>
                    </div>
                    <div className="text-sm text-primary-200">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right side - Featured Activity Spotlight */}
          {currentFeatured && (
            <div className="relative">
              <div className="bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-accent-400 rounded-full animate-pulse" />
                  <span className="text-primary-200 text-sm font-medium">Featured Experience</span>
                </div>
                
                <div className="aspect-video bg-gradient-to-br from-accent-400/20 to-secondary-400/20 rounded-2xl mb-4 flex items-center justify-center border border-white/10">
                  <div className="text-center text-white/80">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Beautiful {currentFeatured.location}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-white">
                  {currentFeatured.activity}
                </h3>
                <p className="text-primary-100 text-sm mb-3 line-clamp-2">
                  {currentFeatured.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                    <span className="text-accent-300 font-semibold">{currentFeatured.rating}</span>
                    <span className="text-primary-200 text-sm ml-1">• {currentFeatured.duration}</span>
                  </div>
                  <button className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Activity rotation indicators */}
                <div className="flex gap-2 mt-4 justify-center">
                  {featuredActivities.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setFeaturedIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === featuredIndex ? 'bg-accent-400 w-6' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom organic shape */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;