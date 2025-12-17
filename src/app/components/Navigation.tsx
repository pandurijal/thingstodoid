import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            thingstodo<span className="text-sm text-neutral-500">.id</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-primary-600 font-medium">
              Browse Activities
            </Link>
            <Link
              href="/itinerary"
              className="text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Plan Itinerary
            </Link>
            <Link
              href="/esim"
              className="text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Travel eSIM
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
