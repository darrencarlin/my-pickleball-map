import { MapPin, Trophy, Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { SignInButton } from "@/components/buttons/sign-in-button";
import { SignOutButton } from "@/components/buttons/sign-out-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-green-200 bg-white/80 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <span className="font-bold text-gray-900 md:text-xl">
                My Pickleball Map
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Button asChild variant="outline">
                    <Link href="/map">Map</Link>
                  </Button>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <SignInButton />
                  <Button asChild variant="outline">
                    <Link href="/auth/sign-up">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            Find Your Perfect
            <span className="block text-green-600">Pickleball Court</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-600">
            Discover, track, and check into pickleball courts near you. Keep
            track of your favorite courts and see how often you play.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {session ? (
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Link href="/map">
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Courts
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Link href="/auth/sign-up">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid gap-8 mt-20 md:grid-cols-3">
          <div className="p-6 bg-white border border-green-100 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Interactive Map
            </h3>
            <p className="text-gray-600">
              Browse courts on an interactive map. Pan around to discover new
              courts in your area and see detailed information about each
              location.
            </p>
          </div>

          <div className="p-6 bg-white border border-green-100 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Track Your Play
            </h3>
            <p className="text-gray-600">
              Check into courts when you play and keep track of your favorite
              locations. See how many times you&apos;ve played at each court.
            </p>
          </div>

          <div className="p-6 bg-white border border-green-100 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Add New Courts
            </h3>
            <p className="text-gray-600">
              Help grow the community by adding new pickleball courts to the
              map. Choose locations directly on the map for precise positioning.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!session && (
          <div className="p-8 mt-20 text-center bg-white border border-green-100 rounded-lg shadow-sm">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Ready to Start Playing?
            </h2>
            <p className="mb-6 text-gray-600">
              Join our community of pickleball enthusiasts and never lose track
              of your favorite courts again.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Link href="/auth/sign-up">Create Your Account</Link>
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white border-t border-green-200">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="w-6 h-6 text-green-600" />
            <span className="text-lg font-semibold text-gray-900">
              My Pickleball Map
            </span>
          </div>
          <p className="mt-2 text-center text-gray-500">
            © 2025 My Pickleball Map. Find your game.
          </p>
        </div>
      </footer>
    </div>
  );
}
