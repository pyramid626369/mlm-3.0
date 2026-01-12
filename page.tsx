"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FlowChainLogo } from "@/components/flowchain-logo"
import {
  ArrowRight,
  Activity,
  TrendingUp,
  Globe,
  Zap,
  Shield,
  Users,
  Wallet,
  Check,
  Award,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Lock,
  CreditCard,
  BookOpen,
  Clock,
} from "lucide-react"
import { useState } from "react"
import { LearnMoreDialog } from "@/components/learn-more-dialog"

export default function HomePage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)

  const partnerLogos = ["OpenAI", "Amazon", "Google", "Anthropic", "Shopify", "Airbnb", "Stripe", "Vercel"]

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Stripe-inspired mesh gradient background */}
      <div className="fixed inset-0 mesh-gradient-light" />
      <div className="fixed inset-0 grid-pattern-light" />
      <div className="fixed inset-0 texture-overlay" />

      {/* Floating blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob absolute w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-br from-pink-200/40 to-orange-200/40 animate-float-slow" />
        <div
          className="blob absolute w-[500px] h-[500px] top-1/4 -right-32 bg-gradient-to-br from-purple-200/30 to-cyan-200/30 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="blob absolute w-[400px] h-[400px] bottom-1/4 left-1/4 bg-gradient-to-br from-cyan-200/20 to-purple-200/20 animate-float-slow"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl">
        <div className="bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-gray-300/80 overflow-hidden">
          <div className="px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16 md:h-20">
              <FlowChainLogo size="sm" showTagline={false} />

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#how-it-works"
                  className="text-sm text-gray-900 hover:text-[#E85D3B] transition-all duration-300 font-semibold relative group"
                >
                  How it Works
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E85D3B] to-[#d14d2c] group-hover:w-full transition-all duration-300" />
                </a>
                <a
                  href="#leaderboard"
                  className="text-sm text-gray-900 hover:text-[#E85D3B] transition-all duration-300 font-semibold relative group"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push("/leaderboard")
                  }}
                >
                  Leaderboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#E85D3B] to-[#d14d2c] group-hover:w-full transition-all duration-300" />
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/participant/login")}
                  className="text-gray-900 hover:text-[#E85D3B] hover:bg-gray-100/80 font-semibold hidden sm:inline-flex transition-all duration-300 rounded-xl"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/participant/register")}
                  className="relative bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-size-200 hover:from-green-500 hover:via-blue-500 hover:to-purple-500 text-black font-bold shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-pink-500/50 hover:scale-105 transition-all duration-500 rounded-xl overflow-hidden"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </Button>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-gray-100/80 rounded-xl transition-all duration-300"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in-up">
                <div className="flex flex-col gap-3">
                  <a
                    href="#how-it-works"
                    className="text-gray-900 hover:text-[#E85D3B] py-2.5 px-3 font-medium transition-all duration-300 rounded-xl hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How it Works
                  </a>
                  <a
                    href="#leaderboard"
                    className="text-gray-900 hover:text-[#E85D3B] py-2.5 px-3 font-medium transition-all duration-300 rounded-xl hover:bg-gray-50"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push("/leaderboard")
                      setMobileMenuOpen(false)
                    }}
                  >
                    Leaderboard
                  </a>
                  <Button
                    variant="outline"
                    className="mt-2 bg-white border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-300"
                    onClick={() => router.push("/participant/login")}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Split Layout */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div className="space-y-8 animate-slide-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Trusted by 50,000+ participants</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                  <span className="gradient-text-coral">Financial</span>
                  <br />
                  infrastructure
                  <br />
                  to grow your
                  <br />
                  <span className="text-[#E85D3B]">network</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed">
                  Join the millions who use FlowChain to participate in structured contribution networks, manage
                  rewards, and build a more profitable future.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/participant/register")}
                  className="h-14 px-8 text-lg font-semibold bg-[#E85D3B] hover:bg-[#d14d2c] text-white rounded-full shadow-lg shadow-[#E85D3B]/30 hover:shadow-xl hover:shadow-[#E85D3B]/50 hover:scale-105 transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowLearnMore(true)}
                  className="h-14 px-8 text-lg font-semibold border-gray-300 hover:bg-gray-50 rounded-full"
                >
                  <BookOpen className="mr-2 h-5 w-5 text-[#E85D3B]" />
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative animate-slide-in-right">
              <div className="relative">
                {/* Main dashboard mockup */}
                <div className="dashboard-mockup p-4 sm:p-6 animate-float-slow">
                  {/* Dashboard header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E85D3B] to-[#d14d2c] flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Dashboard</div>
                        <div className="text-xs text-gray-500">Today</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3">
                      <div className="text-xs text-purple-600 font-medium mb-1">Volume</div>
                      <div className="text-lg font-bold text-gray-900">$24,847</div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +12.5%
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl p-3">
                      <div className="text-xs text-cyan-600 font-medium mb-1">Users</div>
                      <div className="text-lg font-bold text-gray-900">2,847</div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +8.2%
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3">
                      <div className="text-xs text-orange-600 font-medium mb-1">Rewards</div>
                      <div className="text-lg font-bold text-gray-900">$4,521</div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +15.3%
                      </div>
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="h-32 bg-gradient-to-t from-purple-100/50 to-transparent rounded-xl relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 Q50,60 100,70 T200,50 T300,60 T400,30 L400,100 L0,100 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M0,80 Q50,60 100,70 T200,50 T300,60 T400,30"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                {/* Floating notification card */}
                <div
                  className="absolute -bottom-4 -left-4 sm:-left-8 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Payment Received</div>
                      <div className="text-xs text-gray-500">+$250.00 USDT</div>
                    </div>
                  </div>
                </div>

                {/* Floating rank badge */}
                <div
                  className="absolute -top-4 -right-4 sm:-right-8 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-float"
                  style={{ animationDelay: "2s" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Gold Rank</div>
                      <div className="text-xs text-gray-500">+5% bonus</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Logo Marquee */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by leading organizations worldwide</p>
          <div className="marquee-container">
            <div className="marquee-content">
              {[...partnerLogos, ...partnerLogos].map((logo, i) => (
                <div
                  key={i}
                  className="text-2xl font-bold text-gray-300 hover:text-gray-400 transition-colors cursor-default"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                value: "50K+",
                label: "Active Participants",
                icon: Users,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              { value: "$2.5M+", label: "Total Volume", icon: Wallet, color: "text-[#E85D3B]", bg: "bg-orange-50" },
              { value: "150+", label: "Countries", icon: Globe, color: "text-cyan-600", bg: "bg-cyan-50" },
              { value: "99.9%", label: "Uptime", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
            ].map((stat, i) => (
              <div
                key={i}
                className="metric-card text-center group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Removed Features Section */}

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-[#E85D3B] text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Get started in <span className="gradient-text-coral">3 simple steps</span>
            </h2>
            <p className="text-lg text-gray-600">Join thousands of participants in our structured network.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[#E85D3B] via-purple-500 to-cyan-500" />

              {[
                {
                  step: "01",
                  title: "Create Account",
                  description:
                    "Sign up with your details, complete profile setup, and pay the one-time activation fee.",
                  icon: Users,
                  color: "#E85D3B",
                },
                {
                  step: "02",
                  title: "Make Contribution",
                  description: "Submit your contribution through secure crypto or bank transfer methods.",
                  icon: CreditCard,
                  color: "#7c3aed",
                },
                {
                  step: "03",
                  title: "Start Earning",
                  description: "Access the network, complete challenges, and watch your rewards grow.",
                  icon: TrendingUp,
                  color: "#22d3ee",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative text-center animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="relative z-10 mb-6">
                    <div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white text-2xl font-bold shadow-xl transition-transform hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                        boxShadow: `0 20px 40px -10px ${item.color}40`,
                      }}
                    >
                      <item.icon className="h-9 w-9" />
                    </div>
                  </div>
                  <span className="inline-block text-sm font-bold text-gray-400 mb-2">STEP {item.step}</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rank Tiers */}
      {/* Removed Rank Tiers Section */}

      {/* Testimonials */}
      {/* Removed Testimonials Section */}

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of participants already growing their network with FlowChain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push("/participant/register")}
                  className="h-14 px-10 text-lg font-semibold bg-white text-gray-900 hover:bg-gray-100 rounded-full"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/leaderboard")}
                  className="h-14 px-8 text-lg font-semibold border-white/30 text-white hover:bg-white/10 rounded-full"
                >
                  View Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn More Dialog */}
      <LearnMoreDialog open={showLearnMore} onOpenChange={setShowLearnMore} />

      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <FlowChainLogo size="sm" showTagline={false} />
              <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                The world's first platform that doubles your investment in 30 days with 24/7 support and guaranteed
                returns.
              </p>
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-900 mb-1">Corporate Headquarters</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  1600 Amphitheatre Parkway
                  <br />
                  Mountain View, CA 94043
                  <br />
                  United States
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#how-it-works" className="hover:text-gray-900 transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="/leaderboard" className="hover:text-gray-900 transition-colors">
                    Leaderboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-emerald-600" />
                  <span className="font-medium text-emerald-600">24/7 Available</span>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 FlowChain. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="h-4 w-4" />
                SSL Secured
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                Bank-Grade Security
              </span>
              <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <Zap className="h-4 w-4" />
                2X Guaranteed
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
