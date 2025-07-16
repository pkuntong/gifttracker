import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Gift, Users, Calendar, TrendingUp, Shield, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Gift Tracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🎁 AI-Powered Gift Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never Forget a Gift Again
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The ultimate gift tracking and management platform. Organize gifts, track budgets, 
            and get AI-powered recommendations for the perfect present every time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Perfect Gift Giving
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From tracking budgets to AI recommendations, we've got you covered for every occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Smart Gift Tracking</CardTitle>
              <CardDescription>
                Organize gifts by recipient, occasion, and status. Never lose track of what you've bought or planned.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Get personalized gift suggestions based on recipient preferences and past choices.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Family Sharing</CardTitle>
              <CardDescription>
                Share wishlists and coordinate gifts with family members. Perfect for group celebrations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Smart Reminders</CardTitle>
              <CardDescription>
                Never miss important dates with intelligent reminders and occasion tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Track spending across all gifts with multi-currency support and financial insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Mobile Optimized</CardTitle>
              <CardDescription>
                Access your gift lists anywhere with our mobile-first design and PWA capabilities.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white border-0">
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-white" />
            <h2 className="text-3xl font-bold mb-4">
              Start Giving Better Gifts Today
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of users who never forget a gift again.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Start Your Free Trial
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Gift className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Gift Tracker</span>
            </div>
            <p className="text-gray-600">
              Made with ❤️ for better gift management
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
