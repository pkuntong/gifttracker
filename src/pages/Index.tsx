import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Gift, Users, Calendar, TrendingUp, Shield, Zap, Heart, Star, Check, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleProtectedLink = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login', { state: { from: path } });
    }
  };

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
            🎁 Smart Gift Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never Forget a Gift Again
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The ultimate gift tracking and management platform. Organize gifts, track budgets, 
            and get smart recommendations for the perfect present every time.
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
              <CardTitle>Smart Recommendations</CardTitle>
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

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you need more features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200 hover:shadow-md transition-all">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Shield className="h-8 w-8 text-gray-500" />
              </div>
              <CardTitle className="text-xl">Free</CardTitle>
              <div className="text-4xl font-bold text-primary">$0</div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Up to 10 people</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic gift tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Simple reminders</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Mobile access</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic support</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-primary relative hover:shadow-lg transition-all">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
              <CardTitle className="text-xl">Premium</CardTitle>
              <div className="text-4xl font-bold text-primary">$9.99</div>
              <CardDescription>per month</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Unlimited people</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">AI recommendations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Family sharing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Budget tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Gift coordination</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Shared wishlists</span>
                </li>
              </ul>
              <Button className="w-full mt-6" asChild>
                <Link to="/register">Start Free Trial</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Loved by Gift Givers Everywhere
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Gift Tracker has completely changed how I manage gifts for my family. 
                I never forget birthdays anymore and the AI recommendations are spot-on!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">S</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Family Manager</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The budget tracking feature is incredible. I can see exactly how much 
                I'm spending on gifts and stay within my budget."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold">M</span>
                </div>
                <div>
                  <div className="font-semibold">Mike Wilson</div>
                  <div className="text-sm text-gray-500">Budget Conscious</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Perfect for coordinating gifts with my extended family. 
                We can all see what's been bought and avoid duplicates!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold">E</span>
                </div>
                <div>
                  <div className="font-semibold">Emma Davis</div>
                  <div className="text-sm text-gray-500">Family Coordinator</div>
                </div>
              </div>
            </CardContent>
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
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Gift Tracker</span>
              </div>
              <p className="text-gray-600 mb-4">
                Professional gift management for everyone
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleProtectedLink('/app/dashboard'); }} className="hover:text-gray-900 cursor-pointer">Dashboard</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleProtectedLink('/app/gifts'); }} className="hover:text-gray-900 cursor-pointer">Gift Tracking</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleProtectedLink('/app/people'); }} className="hover:text-gray-900 cursor-pointer">People Management</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/help" className="hover:text-gray-900">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-gray-900">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy - Coming Soon'); }} className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service - Coming Soon'); }} className="hover:text-gray-900">Terms of Service</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Cookie Policy - Coming Soon'); }} className="hover:text-gray-900">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 mt-8 text-center text-gray-600">
            <p>&copy; 2025 Gift Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
