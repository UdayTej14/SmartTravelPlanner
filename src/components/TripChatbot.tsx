"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithTripAssistant } from "@/lib/gemini";
import type { ChatMessage, TripPlan, DayPlan } from "@/lib/gemini";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface Props {
  trip: {
    destination: string;
    destinations?: string[];
    days: number;
    travelers: number;
    budget: string;
    interests: string[];
    plan: TripPlan;
  };
  onPackingUpdate?: (additions: string[], removals: string[]) => void;
  onPlanUpdate?: (updatedDays: DayPlan[]) => void;
}

const QUICK_PROMPTS = [
  "What should I pack?",
  "Give me budget tips",
  "Must-try local foods?",
  "Change day 1 to museums",
];

export default function TripChatbot({ trip, onPackingUpdate, onPlanUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, history]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: "user", content: msg };
    setHistory((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithTripAssistant(trip, [...history, userMsg], msg);
      setHistory((prev) => [...prev, { role: "assistant", content: response.text }]);

      if (onPackingUpdate && (response.packingAdditions?.length || response.packingRemovals?.length)) {
        onPackingUpdate(response.packingAdditions ?? [], response.packingRemovals ?? []);
      }

      if (onPlanUpdate && response.planUpdates?.length) {
        onPlanUpdate(response.planUpdates);
      }
    } catch {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into an issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-btn text-white flex items-center justify-center shadow-lg pulse-accent"
        aria-label="Open travel assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden slide-up"
          style={{
            height: "480px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}
          >
            <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center flex-shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Trip Assistant
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {trip.destinations && trip.destinations.length > 1
                  ? trip.destinations.join(" → ")
                  : trip.destination} · Can edit your plan
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Welcome + quick prompts */}
            {history.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "var(--chat-bot)", border: "1px solid var(--border)" }}
                  >
                    <Bot size={14} style={{ color: "var(--accent-blue)" }} />
                  </div>
                  <div
                    className="px-3 py-2.5 rounded-2xl rounded-tl-sm text-sm max-w-[85%]"
                    style={{ background: "var(--chat-bot)", color: "var(--text-secondary)" }}
                  >
                    Hi! I&apos;m your travel assistant for{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {trip.destinations && trip.destinations.length > 1
                        ? trip.destinations.join(" → ")
                        : trip.destination}
                    </strong>.
                    I can answer questions, update your packing list, or <strong>change days in your itinerary</strong>!
                  </div>
                </div>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-2 ml-9">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs px-2.5 py-1.5 rounded-full transition-all"
                      style={{
                        background: "rgba(14,165,233,0.1)",
                        border: "1px solid rgba(14,165,233,0.25)",
                        color: "var(--accent-blue)",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat history */}
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: msg.role === "user" ? "var(--chat-user)" : "var(--chat-bot)",
                    border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                  }}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Bot size={14} style={{ color: "var(--accent-blue)" }} />
                  )}
                </div>
                <div
                  className="px-3 py-2.5 text-sm max-w-[85%] whitespace-pre-wrap"
                  style={{
                    background: msg.role === "user" ? "var(--chat-user)" : "var(--chat-bot)",
                    color: msg.role === "user" ? "white" : "var(--text-secondary)",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 items-start">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--chat-bot)", border: "1px solid var(--border)" }}
                >
                  <Bot size={14} style={{ color: "var(--accent-blue)" }} />
                </div>
                <div
                  className="px-3 py-3 flex items-center gap-1"
                  style={{ background: "var(--chat-bot)", borderRadius: "18px 18px 18px 4px" }}
                >
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--text-muted)" }} />
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--text-muted)" }} />
                  <span className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--text-muted)" }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3"
            style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}
          >
            <input
              ref={inputRef}
              className="flex-1 text-sm rounded-xl px-3 py-2 outline-none"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder='e.g. "Change day 2 to beaches"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
              style={{
                background: input.trim() && !loading ? "var(--accent-blue)" : "var(--bg-card)",
                color: input.trim() && !loading ? "white" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
