import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Gift, 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock, 
  Heart,
  Star,
  ArrowRight,
  Sparkles
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="w-4 h-4 mr-2" />
                Perfect for Families
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Never Forget a Gift or 
                  <span className="text-primary"> Blow Your Budget</span> Again
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  The family gift tracker that saves you hours of stress and hundreds of dollars. 
                  Organize gifts, track spending, and coordinate with family members - all for less than a coffee.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary-dark shadow-medium"
                  asChild
                >
                  <Link to="/register">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  asChild
                >
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <img 
                src={heroImage} 
                alt="Gift Tracker Dashboard"
                className="rounded-2xl shadow-large w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Tired of Gift-Giving Chaos?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every year it's the same story: forgotten birthdays, duplicate gifts, blown budgets, 
              and last-minute panic shopping. There has to be a better way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="text-center">
                <Clock className="w-12 h-12 text-destructive mx-auto mb-4" />
                <CardTitle className="text-xl">Last-Minute Panic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  "Wait, when is Mom's birthday again?" Racing to stores at the last minute, 
                  settling for whatever's left on the shelf.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="text-center">
                <DollarSign className="w-12 h-12 text-destructive mx-auto mb-4" />
                <CardTitle className="text-xl">Budget Disasters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Overspending during holidays, no idea how much you've already spent, 
                  and credit card bills that make you cringe.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="text-center">
                <Gift className="w-12 h-12 text-destructive mx-auto mb-4" />
                <CardTitle className="text-xl">Duplicate Gifts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  "Didn't we already get him this last year?" Family members buying the same gifts, 
                  awkward returns, and disappointed faces.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Finally, Gift Giving Made Simple
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GiftTracker.cc turns gift chaos into organized bliss. 
              Plan ahead, stay on budget, and give gifts that create lasting memories.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Never Miss an Occasion</h3>
                    <p className="text-muted-foreground">
                      Smart reminders for birthdays, anniversaries, holidays, and special events. 
                      Get notified weeks in advance so you can plan the perfect gift.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Stay on Budget</h3>
                    <p className="text-muted-foreground">
                      Set spending limits per person or occasion. Track every purchase and see 
                      exactly where your gift budget stands in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Family Coordination</h3>
                    <p className="text-muted-foreground">
                      Share lists with family members. No more duplicate gifts or awkward conversations. 
                      Everyone knows what's been bought and what's still needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-secondary p-8 rounded-2xl text-secondary-foreground">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Just $5/month</h3>
                <p className="text-lg opacity-90">
                  Less than a fancy coffee, but saves you hundreds in overspending 
                  and hours of last-minute shopping stress.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Unlimited gift lists</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Budget tracking & alerts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Family sharing & coordination</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <span>Smart occasion reminders</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90"
                  asChild
                >
                  <Link to="/register">
                    Start Your Free Trial
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
              Families Love GiftTracker
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of organized families who've transformed their gift-giving
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <CardDescription>
                  "GiftTracker saved our Christmas! No more rushing to stores or buying 
                  duplicate toys. Our kids got exactly what they wanted, and we stayed on budget."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah M.</p>
                    <p className="text-sm text-muted-foreground">Mom of 3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <CardDescription>
                  "Finally, my husband and I are coordinated on gifts! No more secret shopping 
                  trips that lead to buying the same thing. Worth every penny."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold">Jennifer L.</p>
                    <p className="text-sm text-muted-foreground">Busy Parent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <CardDescription>
                  "I used to overspend every holiday season. GiftTracker's budget tracking 
                  helped me save over $300 last Christmas while still giving amazing gifts!"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Mike T.</p>
                    <p className="text-sm text-muted-foreground">Dad & Budget Pro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to Transform Your Gift Giving?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of organized families. Start your 14-day free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-medium"
                asChild
              >
                <Link to="/register">
                  Start Free Trial - $0 Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>$5/month after trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
