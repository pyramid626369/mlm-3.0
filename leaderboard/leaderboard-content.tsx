"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FlowChainLogo } from "@/components/flowchain-logo"
import { UserRankBadge } from "@/components/user-rank-badge"
import { Trophy, Search, ArrowLeft, Crown, Medal, Award, Gem, Globe, Users, Sparkles } from "lucide-react"
import type { UserRank } from "@/lib/types"

interface LeaderboardEntry {
  position: number
  username: string
  participantNumber: number
  rank: UserRank
  participation_count: number
  country: string
  joinedAt: string
}

export default function LeaderboardContent() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRank, setFilterRank] = useState<UserRank | "all">("all")

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard")
      const data = await response.json()
      if (data.success) {
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeaderboard = leaderboard.filter((entry) => {
    const matchesSearch = entry.username.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRank = filterRank === "all" || entry.rank === filterRank
    return matchesSearch && matchesRank
  })

  const getPositionStyle = (position: number) => {
    if (position === 1)
      return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-white shadow-xl shadow-yellow-300/50"
    if (position === 2)
      return "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-white shadow-xl shadow-slate-300/50"
    if (position === 3)
      return "bg-gradient-to-br from-orange-400 via-orange-500 to-amber-700 text-white shadow-xl shadow-orange-300/50"
    return "bg-slate-100 text-slate-600 border border-slate-200"
  }

  const rankCounts = {
    platinum: leaderboard.filter((e) => e.rank === "platinum").length,
    gold: leaderboard.filter((e) => e.rank === "gold").length,
    silver: leaderboard.filter((e) => e.rank === "silver").length,
    bronze: leaderboard.filter((e) => e.rank === "bronze").length,
  }

  const topThree = filteredLeaderboard.slice(0, 3)
  const restOfLeaders = filteredLeaderboard.slice(3)

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 mesh-gradient-light" />
      <div className="fixed inset-0 -z-10 grid-pattern-light" />
      <div className="fixed inset-0 -z-10 texture-overlay" />

      {/* Floating animated blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const isAuthenticated = typeof window !== "undefined" && sessionStorage.getItem("participant_token")
                  router.push(isAuthenticated ? "/participant/dashboard" : "/")
                }}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <FlowChainLogo size="sm" showTagline={false} />
            </div>
            <Button
              onClick={() => router.push("/participant/login")}
              className="btn-primary-light shadow-lg hover:shadow-xl transition-all"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-cyan-100 border border-purple-200 mb-6 animate-scale-in">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Top 100 Global Rankings</span>
          </div>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E85D3B] to-purple-600 blur-2xl opacity-20 animate-pulse-soft" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E85D3B] to-[#c94a2a] mb-6 shadow-2xl shadow-orange-200 animate-float">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 animate-fade-in-up-delay-1">
            Global <span className="gradient-text-coral">Leaderboard</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in-up-delay-2">
            Compete with the best participants worldwide and climb your way to the top
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              rank: "platinum" as const,
              icon: Gem,
              count: rankCounts.platinum,
              label: "Platinum",
              gradient: "from-violet-100 via-purple-100 to-indigo-100",
              iconBg: "bg-violet-200",
              iconColor: "text-violet-700",
            },
            {
              rank: "gold" as const,
              icon: Crown,
              count: rankCounts.gold,
              label: "Gold",
              gradient: "from-yellow-100 via-amber-100 to-orange-100",
              iconBg: "bg-yellow-200",
              iconColor: "text-yellow-700",
            },
            {
              rank: "silver" as const,
              icon: Award,
              count: rankCounts.silver,
              label: "Silver",
              gradient: "from-slate-100 via-gray-100 to-slate-100",
              iconBg: "bg-slate-300",
              iconColor: "text-slate-700",
            },
            {
              rank: "bronze" as const,
              icon: Medal,
              count: rankCounts.bronze,
              label: "Bronze",
              gradient: "from-orange-100 via-amber-100 to-yellow-100",
              iconBg: "bg-orange-200",
              iconColor: "text-orange-700",
            },
          ].map((item, i) => (
            <Card
              key={item.rank}
              className={`border-slate-200 bg-gradient-to-br ${item.gradient} cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up ${
                filterRank === item.rank ? "ring-2 ring-[#22d3ee] shadow-xl scale-105" : "shadow-lg"
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={() => setFilterRank(filterRank === item.rank ? "all" : item.rank)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.iconBg} shadow-md`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{item.count}</p>
                  <p className="text-sm text-slate-600 font-medium">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {topThree.length >= 3 && (
          <div className="mb-12 animate-fade-in-up-delay-3">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Top 3 Champions</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* 2nd Place */}
              <div className="md:order-1 md:mt-8">
                <Card className="card-elevated border-slate-200 overflow-hidden group hover:scale-105 transition-all duration-300">
                  <div className="h-3 bg-gradient-to-r from-slate-300 to-slate-400" />
                  <CardContent className="p-6 text-center">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-slate-300 blur-xl opacity-50 animate-pulse-soft" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center shadow-xl border-4 border-white">
                        <Trophy className="h-10 w-10 text-slate-600" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white shadow-lg border border-slate-200">
                        <span className="text-xl font-bold text-slate-600">2</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg">
                      {topThree[1].username.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">@{topThree[1].username}</h3>
                    <p className="text-sm text-slate-500 mb-3">#{topThree[1].participantNumber}</p>
                    <UserRankBadge rank={topThree[1].rank} size="sm" />
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-2xl font-bold text-[#22d3ee]">{topThree[1].participation_count}</p>
                      <p className="text-xs text-slate-500">Participations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 1st Place - Largest */}
              <div className="md:order-2">
                <Card className="card-elevated border-yellow-300 overflow-hidden group hover:scale-105 transition-all duration-300">
                  <div className="h-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 animate-gradient" />
                  <CardContent className="p-8 text-center bg-gradient-to-b from-yellow-50/50 to-white">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-60 animate-pulse-soft" />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 flex items-center justify-center shadow-2xl border-4 border-white">
                        <Crown className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white shadow-xl border-2 border-yellow-400">
                        <span className="text-2xl font-bold gradient-text-coral">1</span>
                      </div>
                    </div>
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-xl">
                      {topThree[0].username.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">@{topThree[0].username}</h3>
                    <p className="text-sm text-slate-500 mb-4">#{topThree[0].participantNumber}</p>
                    <UserRankBadge rank={topThree[0].rank} size="md" />
                    <div className="mt-6 pt-6 border-t border-yellow-200">
                      <p className="text-3xl font-bold gradient-text-coral">{topThree[0].participation_count}</p>
                      <p className="text-sm text-slate-600 font-medium">Participations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3 md:mt-12">
                <Card className="card-elevated border-slate-200 overflow-hidden group hover:scale-105 transition-all duration-300">
                  <div className="h-3 bg-gradient-to-r from-orange-400 to-amber-600" />
                  <CardContent className="p-6 text-center">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-orange-400 blur-xl opacity-50 animate-pulse-soft" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-200 to-amber-500 flex items-center justify-center shadow-xl border-4 border-white">
                        <Medal className="h-10 w-10 text-orange-700" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white shadow-lg border border-orange-200">
                        <span className="text-xl font-bold text-orange-600">3</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg">
                      {topThree[2].username.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">@{topThree[2].username}</h3>
                    <p className="text-sm text-slate-500 mb-3">#{topThree[2].participantNumber}</p>
                    <UserRankBadge rank={topThree[2].rank} size="sm" />
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-2xl font-bold text-[#22d3ee]">{topThree[2].participation_count}</p>
                      <p className="text-xs text-slate-500">Participations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <Card className="border-slate-200 bg-white/90 backdrop-blur-sm shadow-xl mb-8 animate-fade-in-up-delay-4">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 input-field-light h-11 text-base"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "platinum", "gold", "silver", "bronze"] as const).map((rank) => (
                  <Button
                    key={rank}
                    size="sm"
                    variant={filterRank === rank ? "default" : "outline"}
                    onClick={() => setFilterRank(rank)}
                    className={
                      filterRank === rank
                        ? "bg-[#22d3ee] text-white hover:bg-[#06b6d4] shadow-lg hover:shadow-xl transition-all"
                        : "border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-all"
                    }
                  >
                    {rank === "all" ? "All Ranks" : rank.charAt(0).toUpperCase() + rank.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        <Card className="border-slate-200 bg-white/90 backdrop-blur-sm shadow-xl animate-scale-in">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6">
            <CardTitle className="text-slate-900 flex items-center gap-3 text-xl">
              <Users className="h-6 w-6 text-[#22d3ee]" />
              All Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="h-12 w-12 border-4 border-violet-200 border-t-[#E85D3B] rounded-full animate-spin mx-auto mb-6" />
                <p className="text-slate-600 text-lg">Loading leaderboard...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Rank
                      </th>
                      <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Participant
                      </th>
                      <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wide hidden md:table-cell">
                        Country
                      </th>
                      <th className="text-left py-5 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-right py-5 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Participations
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {restOfLeaders.map((entry, i) => (
                      <tr
                        key={entry.participantNumber}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-200 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.02}s` }}
                      >
                        <td className="py-5 px-6">
                          <div
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-base font-bold ${getPositionStyle(entry.position)} transition-all`}
                          >
                            {entry.position}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center text-white font-bold text-base shadow-lg">
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-slate-900 font-semibold text-base">@{entry.username}</p>
                              <p className="text-sm text-slate-500">#{entry.participantNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 hidden md:table-cell">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{entry.country}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <UserRankBadge rank={entry.rank} size="sm" />
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span className="text-[#22d3ee] font-bold text-lg">{entry.participation_count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLeaderboard.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 text-lg mb-2">No participants found</p>
                    <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
