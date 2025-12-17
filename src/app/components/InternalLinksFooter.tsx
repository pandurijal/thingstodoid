import Link from "next/link";

const InternalLinksFooter = () => {
  const cities = [
    { name: "Bali", slug: "bali" },
    { name: "Jakarta", slug: "jakarta" },
    { name: "Yogyakarta", slug: "yogyakarta" },
    { name: "Lombok", slug: "lombok" },
    { name: "Surabaya", slug: "surabaya" }
  ];

  const categories = [
    { name: "Temple Activities", slug: "temple-activities" },
    { name: "Cultural Activities", slug: "cultural-activities" },
    { name: "Beach Activities", slug: "beach-activities" },
    { name: "Nature Activities", slug: "nature-activities" },
    { name: "Adventure Activities", slug: "adventure-activities" },
    { name: "Shopping Activities", slug: "shopping-activities" },
    { name: "Food Activities", slug: "food-activities" },
    { name: "Family Activities", slug: "family-activities" }
  ];

  return (
    <div className="bg-neutral-100 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Explore by City */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Explore by City</h3>
            <ul className="space-y-2">
              {cities.map(city => (
                <li key={city.slug}>
                  <Link
                    href={`/?city=${city.slug}`}
                    className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    Things to do in {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map(category => (
                <li key={category.slug}>
                  <Link
                    href={`/activities/${category.slug}`}
                    className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/itinerary"
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                >
                  AI Itinerary Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/esim"
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Indonesia Travel eSIM
                </Link>
              </li>
              <li>
                <Link
                  href="/bali"
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Best Things to Do in Bali
                </Link>
              </li>
              <li>
                <Link
                  href="/jakarta"
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Best Things to Do in Jakarta
                </Link>
              </li>
              <li>
                <Link
                  href="/activities/beach-activities"
                  className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Beach Activities in Indonesia
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* City + Category Combinations */}
        <div className="mt-8 pt-8 border-t border-neutral-200">
          <h3 className="font-bold text-neutral-900 mb-4">Top Destinations & Activities</h3>
          <div className="flex flex-wrap gap-3">
            {cities.slice(0, 3).map(city => (
              categories.slice(0, 3).map(category => (
                <Link
                  key={`${city.slug}-${category.slug}`}
                  href={`/${city.slug}/category/${category.slug}`}
                  className="text-xs bg-white px-3 py-2 rounded-full text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-colors border border-neutral-200"
                >
                  {category.name} in {city.name}
                </Link>
              ))
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalLinksFooter;
