"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User, Send, Loader2, Sparkles, X, ArrowUpRight, Trophy } from "lucide-react"

interface AIChatbotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIChatbotDialog({ open, onOpenChange }: AIChatbotDialogProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return

    sendMessage({ text: input })
    setInput("")
  }

  const isStreaming = status === "streaming"
  const isReady = status === "ready"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 relative overflow-hidden">
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer my-0" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/30 animate-pulse-soft">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white drop-shadow-lg">
                  FlowChain AI Assistant
                </DialogTitle>
                <DialogDescription className="text-sm text-white/90">
                  Ask me anything about the platform
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea
          ref={scrollRef}
          className="flex-1 p-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30"
        >
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center mb-4 shadow-2xl animate-float">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Welcome to FlowChain AI</h3>
                <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                  I'm your intelligent assistant powered by advanced AI. Ask me about contributions, withdrawals, ranks,
                  or any other questions!
                </p>
                <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-md">
                  {[
                    { text: "How to contribute?", icon: <Send className="h-3 w-3" /> },
                    { text: "How to withdraw?", icon: <ArrowUpRight className="h-3 w-3" /> },
                    { text: "About ranks", icon: <Trophy className="h-3 w-3" /> },
                    { text: "Gas fee info", icon: <Sparkles className="h-3 w-3" /> },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 border-slate-200 hover:border-purple-300 transition-all hover:scale-105"
                      onClick={() => {
                        const question =
                          item.text === "How to contribute?"
                            ? "How do I make a contribution?"
                            : item.text === "How to withdraw?"
                              ? "How do withdrawals work?"
                              : item.text === "About ranks"
                                ? "What are the different ranks?"
                                : "What is gas fee approval?"
                        setInput(question)
                        sendMessage({ text: question })
                      }}
                    >
                      {item.icon}
                      <span className="ml-1">{item.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in-up ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Avatar
                  className={`h-10 w-10 shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-slate-500 to-slate-700"
                      : "bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 animate-pulse-soft"
                  }`}
                >
                  <AvatarFallback className="text-white">
                    {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 rounded-2xl px-5 py-3 shadow-md bg-[rgba(124,126,120,1)] ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#E85D3B] to-orange-500 text-white ml-12"
                      : "bg-white text-slate-900 mr-12 border border-slate-100"
                  }`}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p key={index} className="text-sm whitespace-pre-wrap leading-relaxed">
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="flex gap-3 animate-fade-in">
                <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 shadow-lg animate-pulse-soft">
                  <AvatarFallback className="text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-2xl px-5 py-3 bg-white mr-12 border border-slate-100 shadow-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-sm text-slate-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white shadow-lg">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about FlowChain..."
              disabled={!isReady}
              className="flex-1 bg-slate-50 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 h-11"
            />
            <Button
              type="submit"
              disabled={!isReady || !input.trim()}
              className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:from-purple-700 hover:via-pink-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 h-11 px-6"
            >
              {isStreaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2 text-center">Powered by advanced AI • Responses may vary</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
