"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Shield,
  CreditCard,
  Download,
  Mail,
} from "lucide-react";

type DataPlan = {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  features: string[];
};

const ESIMPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);

  const plans: DataPlan[] = [
    {
      id: "starter",
      name: "Starter",
      data: "1GB",
      validity: "7 days",
      price: 8,
      originalPrice: 12,
      features: ["4G/LTE Speed", "Instant Setup", "24/7 Support"]
    },
    {
      id: "traveler",
      name: "Traveler",
      data: "3GB",
      validity: "14 days", 
      price: 18,
      originalPrice: 25,
      popular: true,
      features: ["4G/LTE Speed", "Instant Setup", "24/7 Support", "Hotspot Sharing"]
    },
    {
      id: "explorer",
      name: "Explorer",
      data: "5GB",
      validity: "30 days",
      price: 28,
      originalPrice: 35,
      features: ["4G/LTE Speed", "Instant Setup", "24/7 Support", "Hotspot Sharing"]
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlan);

  const handlePurchase = () => {
    if (selectedPlan && email) {
      setShowCheckout(true);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setShowEmailSuccess(true);
      setTimeout(() => setShowEmailSuccess(false), 3000);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              thingstodo<span className="text-sm text-neutral-500">.id</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Browse Activities
              </Link>
              <Link href="/itinerary" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Plan Itinerary
              </Link>
              <Link href="/esim" className="text-primary-600 font-medium">
                Travel eSIM
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <span className="text-4xl">🇮🇩</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Indonesia eSIM
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Stay connected during your Indonesia trip with instant eSIM activation. No roaming fees, no SIM card hassle.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-300" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-300" />
              <span>Reliable 4G</span>
            </div>
          </div>
        </div>
      </section>

      {/* Email Collection */}
      <section className="py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Get Updates & Special Offers</h2>
          <p className="text-neutral-600 mb-6">Be the first to know about new plans and discounts</p>
          
          <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Subscribe
            </button>
          </form>
          
          {showEmailSuccess && (
            <div className="mt-4 p-3 bg-secondary-100 text-secondary-800 rounded-lg">
              ✅ Thanks! We&apos;ll keep you updated.
            </div>
          )}
        </div>
      </section>

      {/* Data Plans */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Choose Your Plan</h2>
            <p className="text-neutral-600">Select the perfect data plan for your Indonesia trip</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl p-6 border-2 transition-all cursor-pointer hover:shadow-lg ${
                  selectedPlan === plan.id ? 'border-primary-500 shadow-lg' : 'border-neutral-200'
                } ${plan.popular ? 'ring-2 ring-accent-400 ring-opacity-20' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-neutral-900 mb-2">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-primary-600">${plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-neutral-400 line-through ml-2">${plan.originalPrice}</span>
                    )}
                  </div>
                  <div className="text-neutral-600">
                    <div className="font-semibold text-xl text-neutral-900">{plan.data}</div>
                    <div className="text-sm">{plan.validity}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="w-4 h-4 text-secondary-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>

          {/* Purchase Form */}
          {selectedPlan && (
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                  Complete Your Purchase
                </h3>
                <p className="text-neutral-600">
                  {currentPlan?.name} Plan - {currentPlan?.data} for {currentPlan?.validity}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary-600">${currentPlan?.price}</span>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={!email}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Buy Now - ${currentPlan?.price}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      {showCheckout && currentPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                Purchase Complete!
              </h3>
              <p className="text-neutral-600 text-sm">
                Your Indonesia eSIM is ready
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>Plan:</span>
                <span className="font-medium">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Data:</span>
                <span className="font-medium">{currentPlan.data}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold text-primary-600">${currentPlan.price}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-colors">
                Download eSIM
              </button>
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-neutral-600">
                &copy; {new Date().getFullYear()} ThingsToDo.id
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Discover the best of Indonesia
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ESIMPage;