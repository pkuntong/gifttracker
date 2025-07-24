import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, MessageCircle, BookOpen, Users, Gift, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Help = () => {
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
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/register">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Help Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get help with using Gift Tracker and find answers to common questions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn the basics of Gift Tracker and how to set up your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Create your first gift list</li>
                <li>• Add people to track</li>
                <li>• Set up occasions</li>
                <li>• Configure notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Gift Management</CardTitle>
              <CardDescription>
                Master the art of tracking and managing gifts effectively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Add and track gifts</li>
                <li>• Set budgets and limits</li>
                <li>• Get AI recommendations</li>
                <li>• Share wishlists</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Family & Sharing</CardTitle>
              <CardDescription>
                Coordinate gifts with family members and share wishlists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Create family groups</li>
                <li>• Share wishlists</li>
                <li>• Coordinate gifts</li>
                <li>• Manage permissions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Occasions & Reminders</CardTitle>
              <CardDescription>
                Never miss important dates with smart reminders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Set up occasions</li>
                <li>• Configure reminders</li>
                <li>• Track deadlines</li>
                <li>• Manage notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Analytics & Budgets</CardTitle>
              <CardDescription>
                Track spending and get insights into your gift giving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Monitor spending</li>
                <li>• Set budgets</li>
                <li>• View analytics</li>
                <li>• Export reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Get in touch with our support team for personalized help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <a href="mailto:support@gifttracker.cc">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Support
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://github.com/pkuntong/gifttracker/issues" target="_blank" rel="noopener noreferrer">
                    Report Issue
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I get started with Gift Tracker?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simply sign up for a free account, add the people you want to track gifts for, 
                  and start creating your first gift list. You can begin with our free plan and 
                  upgrade when you need more features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! We use industry-standard encryption and security practices. Your data is 
                  stored securely on Supabase's infrastructure and we never share your personal 
                  information with third parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I share gift lists with family members?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! With our Family plan, you can create family groups, share wishlists, 
                  and coordinate gifts to avoid duplicates. Perfect for holiday celebrations and 
                  special occasions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the AI recommendation work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI analyzes the preferences and interests you've set for each person, 
                  along with your past gift choices, to suggest personalized gift ideas. 
                  The more you use the app, the better the recommendations become.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I export my data?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can export your gift lists, people, and occasions in various formats 
                  including CSV, JSON, and PDF. This is available in our Premium and Family plans.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help; 