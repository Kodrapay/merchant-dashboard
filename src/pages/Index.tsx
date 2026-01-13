import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ArrowRight,
  CreditCard,
  BarChart3,
  Lock,
  Zap,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle"; // Correctly import ThemeToggle

const features = [
  {
    icon: CreditCard,
    title: "Payment processing that just works",
    description:
      "Cards, bank transfers, mobile money. Your customers pay however they want.",
  },
  {
    icon: BarChart3,
    title: "Know your numbers",
    description:
      "Real-time dashboards that actually make sense. See what's working, fix what isn't.",
  },
  {
    icon: Lock,
    title: "Secure by default",
    description:
      "Bank-level security, fraud detection, and compliance. We handle the boring stuff.",
  },
  {
    icon: Zap,
    title: "Fast settlements",
    description:
      "Your money hits your account the next business day. No waiting around.",
  },
];

const stats = [
  { value: "₦50B+", label: "processed this year" },
  { value: "10K+", label: "businesses trust us" },
  { value: "99.9%", label: "uptime" },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "₦0",
    suffix: "/month",
    description: "Built for teams validating new products.",
    features: [
      "No setup fees",
      "Dashboard access",
      "Email support",
      "Standard APIs",
      "Card: 1.9% + ₦100 (capped at ₦2,500)",
      "Bank Transfer: 1.2% + ₦50",
      "Mobile Money: 1.5%",
    ],
    tierInfo: "Perfect for getting started",
  },
  {
    name: "Growth",
    price: "₦15,000",
    suffix: "/month",
    description: "Ideal for scaling companies that need reliability.",
    features: [
      "Priority support",
      "Webhooks",
      "Dispute assistance",
      "Payout scheduling",
      "Card: 1.5% + ₦100 (capped at ₦2,000)",
      "Bank Transfer: 0.8% + ₦50",
      "Mobile Money: 1.2%",
    ],
    highlighted: true,
    tierInfo: "Most popular for growing businesses",
  },
  {
    name: "Enterprise",
    price: "Let's talk",
    suffix: "",
    description: "Custom solutions, advanced controls, and SLAs.",
    features: [
      "Dedicated manager",
      "Custom routing",
      "Uptime SLAs",
      "Security reviews",
      "Custom transaction fees",
      "Negotiated pricing",
      "Premium support",
    ],
    tierInfo: "For high-volume merchants",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/40 to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900">
              <Shield className="h-4 w-4 text-gray-50" />
            </div>
            <span className="text-lg font-semibold text-gray-900">KodraPay</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Pricing
            </a>
            <Link
              to="/checkout"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Try demo
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/merchant/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link to="/merchant/signup">
              <Button size="sm" className="bg-gray-900 text-gray-50 hover:bg-gray-800">Get started</Button>
            </Link>
            <ThemeToggle /> {/* Add ThemeToggle here */}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary animate-in">
                <Sparkles className="h-4 w-4" />
                Built for Nigerian businesses that want reliable payouts and clear numbers.
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-gray-900 animate-in">
                Get paid online, settle fast, and stay in control.
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 animate-in">
                Accept cards, transfers, and payment links with bank-grade security. Ship in minutes, settle as soon as the next day, and see exactly where your money lives.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in">
                <Link to="/merchant/signup">
                  <Button size="xl" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30">
                    Start now, free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/checkout">
                  <Button variant="outline" size="xl" className="border-gray-300 text-gray-700 hover:bg-gray-100 shadow-lg">
                    See how it works
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-6 animate-in">
                No credit card required • Setup in 5 minutes • Start accepting payments today
              </p>
            </div>

            {/* Placeholder for Hero Image/Illustration */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-xl border border-gray-200 animate-in">
              <img
                src="/placeholder.svg" // Replace with a relevant image path
                alt="KodraPay merchant dashboard preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-2xl font-bold">Manage your business</h3>
                <p className="text-gray-200">
                  Track payments, analyze sales, and manage your payouts all in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section moved here for better visual flow */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="animate-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-3xl md:text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Three steps to start accepting payments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
            <div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-gray-50 font-semibold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create your account
              </h3>
              <p className="text-gray-600">
                Sign up with your email. Takes about 2 minutes. We'll verify your business details.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-gray-50 font-semibold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Add payment to your site
              </h3>
              <p className="text-gray-600">
                Copy our payment link or use our simple integration. No coding required unless you want to.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-gray-50 font-semibold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get paid
              </h3>
              <p className="text-gray-600">
                Money lands in your account the next business day. Track everything from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600">
              Built for businesses that want to focus on growing, not wrestling with payment systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg border border-gray-200 bg-card/80 backdrop-blur shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <feature.icon className="h-8 w-8 mb-4 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout/Fraud callout */}
      <section className="py-16 border-t border-gray-200 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm">
                <ShieldCheck className="h-4 w-4" />
                Fast payouts, smart fraud
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Get settled quickly, keep fraud in check.</h3>
              <p className="text-gray-600">
                Trigger manual settlements from your admin, automate T+0/T+1, and review flagged transactions before they go live.
              </p>
              <div className="flex gap-3">
                <Button to="/merchant/signup" asChild>
                  <Link to="/merchant/signup" className="bg-primary text-primary-foreground hover:bg-primary/90">Start accepting payments</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/transactions" className="border-gray-300 text-gray-700 hover:bg-gray-100">Review flagged txns</Link>
                </Button>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 bg-card shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Globe2 className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Settlement snapshot</p>
                  <p className="text-2xl font-semibold text-gray-900">₦9,000,000.00 available</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="text-gray-600">Pending balance</p>
                  <p className="text-lg font-semibold text-gray-900">₦0.00</p>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="text-gray-600">Today’s payouts</p>
                  <p className="text-lg font-semibold text-gray-900">₦1,000,000.00</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Controlled from your dashboard. Approve or decline flagged payments before they settle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-lg text-gray-600">
              No hidden fees, no surprises. Just straightforward pricing that scales with you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-xl border transition-all duration-300 ${plan.highlighted ? "border-primary bg-primary text-primary-foreground shadow-xl scale-[1.05]" : "bg-card border-gray-200 shadow-md hover:shadow-lg"}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p
                    className={`text-sm ${
                      plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span
                    className={`ml-1 text-sm ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {plan.suffix}
                  </span>
                </div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                      <span className={`text-xs ${plan.highlighted ? "text-primary-foreground" : "text-gray-700"}`}>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link to={plan.name === "Enterprise" ? "#" : "/merchant/signup"}>
                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                    {plan.name === "Enterprise" ? "Talk to sales" : plan.name === "Growth" ? "Start with Growth" : "Start with Starter"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <p className={`text-xs mt-3 text-center ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.tierInfo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-gray-200 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join thousands of Nigerian businesses already using KodraPay
            </p>
            <Link to="/merchant/signup">
              <Button size="lg" className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Create your account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900">
                <Shield className="h-3.5 w-3.5 text-gray-50" />
              </div>
              <span className="font-semibold text-gray-900">KodraPay</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="hover:text-gray-900">
                Docs
              </a>
              <a href="#" className="hover:text-gray-900">
                Support
              </a>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 KodraPay
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
