'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Search, Bell, Users, Car, Briefcase, CreditCard, Smartphone, UserX } from 'lucide-react';

const categories = [
  { icon: Car, label: 'Vehicles', desc: 'Bikes, cars, scooters', color: 'text-blue-600 bg-blue-50' },
  { icon: Briefcase, label: 'Bags & Luggage', desc: 'Handbags, backpacks, suitcases', color: 'text-purple-600 bg-purple-50' },
  { icon: CreditCard, label: 'Wallets & Docs', desc: 'ID cards, licenses, passports', color: 'text-yellow-600 bg-yellow-50' },
  { icon: Smartphone, label: 'Electronics', desc: 'Phones, laptops, tablets', color: 'text-cyan-600 bg-cyan-50' },
  { icon: UserX, label: 'Missing Persons', desc: 'Family, children, elderly', color: 'text-red-600 bg-red-50' },
];

const features = [
  { icon: Shield, title: 'AI-Structured Reports', desc: 'Gemini AI converts free-text descriptions into structured data for accurate matching.' },
  { icon: Search, title: 'Semantic Matching', desc: 'Embedding-based similarity search matches lost and found items even when wording differs.' },
  { icon: Bell, title: 'Instant Alerts', desc: 'Get notified the moment a potential match is found for your report.' },
  { icon: Users, title: 'Police Integration', desc: 'Police stations report recovered items directly, linking them to citizen reports.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-sm text-blue-700 mb-6">
              <Shield className="h-4 w-4" />
              Powered by Google Gemini AI
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Smart Lost &amp; Found
              <span className="block text-blue-700">Intelligence Platform</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Report lost items. Police report recovered items. AI automatically matches them using semantic understanding — even when descriptions don't match word for word.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 w-full sm:w-auto">
                  Report a Lost Item
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" />
                  Search Found Items
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
          Supported Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(({ icon: Icon, label, desc, color }) => (
            <Card key={label} className="border-gray-200 hover:shadow-sm transition-shadow">
              <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-2">
                <div className={`rounded-xl p-3 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {['Citizen reports lost item with description & photos', 'Police reports recovered item at station', 'AI matches lost and found reports automatically'].map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-blue-700 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {i + 1}
              </div>
              <p className="text-sm text-gray-600 pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-700" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to get started?</h2>
        <p className="text-gray-500 text-sm mb-6">Create an account as a citizen or police station.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button className="bg-blue-700 hover:bg-blue-800">Register as Citizen</Button>
          </Link>
          <Link href="/signup?role=police">
            <Button variant="outline">Register as Police Station</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t bg-white py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Smart Lost &amp; Found Intelligence Platform. Government of India.
      </footer>
    </div>
  );
}
