"use client";

import { useState, useEffect } from "react";
import { DollarSign, RefreshCw, TrendingUp } from "lucide-react";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "USD" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "EUR" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "GBP" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "JPY" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "INR" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "AUD" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "CAD" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "SGD" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "AED" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "CNY" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "CHF" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "MXN" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "BRL" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "KRW" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "THB" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "IDR" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "MYR" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "PHP" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "ZAR" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "TRY" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "SAR" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "NZD" },
];

interface Props {
  totalCostString: string; // e.g. "USD 800 - 1200 per person"
  days: number;
  travelers: number;
}

function extractUSDRange(costStr: string): { min: number; max: number } {
  const nums = costStr.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10)).filter((n) => n > 0) ?? [];
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: 500, max: 1000 };
}

export default function CurrencyConverter({ totalCostString, days, travelers }: Props) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [toCurrency, setToCurrency] = useState("EUR");
  const [customAmount, setCustomAmount] = useState("");
  const [loadingRates, setLoadingRates] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const { min, max } = extractUSDRange(totalCostString);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        setRates(data.rates ?? {});
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {
        // fallback approximate rates
        setRates({
          EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.2, AUD: 1.53,
          CAD: 1.36, SGD: 1.34, AED: 3.67, CNY: 7.24, CHF: 0.88,
          MXN: 17.1, BRL: 4.97, KRW: 1325, THB: 35.1, IDR: 15700,
          MYR: 4.72, PHP: 56.3, ZAR: 18.7, TRY: 30.8, SAR: 3.75, NZD: 1.63,
        });
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  const rate = rates[toCurrency] ?? 1;
  const currency = CURRENCIES.find((c) => c.code === toCurrency) ?? CURRENCIES[0];

  const convertAmount = (usd: number) => {
    const converted = usd * rate;
    if (converted >= 1_000_000) return `${currency.symbol}${(converted / 1_000_000).toFixed(2)}M`;
    if (converted >= 1_000) return `${currency.symbol}${converted.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  const amountToConvert = customAmount ? parseFloat(customAmount) : null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <DollarSign size={18} style={{ color: "#22c55e" }} />
          Currency Converter
        </h3>
        {lastUpdated && (
          <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <RefreshCw size={10} /> Live rates · {lastUpdated}
          </span>
        )}
      </div>

      {/* Currency Selector */}
      <div className="mb-5">
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
          Convert to
        </label>
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className="input-field text-sm"
          style={{ cursor: "pointer" }}
        >
          {CURRENCIES.filter((c) => c.code !== "USD").map((c) => (
            <option key={c.code} value={c.code} style={{ background: "#16161f" }}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cost Breakdown Cards */}
      {loadingRates ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {[
            {
              label: "Total per person",
              usdMin: min, usdMax: max,
              icon: "",
            },
            {
              label: `Total for ${travelers} traveler${travelers > 1 ? "s" : ""}`,
              usdMin: min * travelers, usdMax: max * travelers,
              icon: "",
            },
            {
              label: "Per day (avg)",
              usdMin: Math.round(min / days), usdMax: Math.round(max / days),
              icon: "",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  {item.icon} {item.label}
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  ${item.usdMin.toLocaleString()} – ${item.usdMax.toLocaleString()} USD
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg" style={{ color: "var(--accent-blue)" }}>
                  {item.usdMin === item.usdMax
                    ? convertAmount(item.usdMin)
                    : `${convertAmount(item.usdMin)} – ${convertAmount(item.usdMax)}`}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{toCurrency}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Amount Converter */}
      <div
        className="p-4 rounded-xl"
        style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}
      >
        <p className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: "var(--accent-blue)" }}>
          <TrendingUp size={12} /> Custom Amount Converter
        </p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "var(--text-muted)" }}>$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter USD amount"
              className="input-field pl-8 text-sm py-2"
            />
          </div>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <div
            className="flex-1 py-2 px-3 rounded-xl text-center font-bold"
            style={{ background: "var(--bg-secondary)", color: "var(--accent-blue)", minWidth: "100px" }}
          >
            {amountToConvert && amountToConvert > 0
              ? convertAmount(amountToConvert)
              : <span style={{ color: "var(--text-muted)", fontWeight: "normal", fontSize: "12px" }}>Result</span>}
          </div>
        </div>
        {rate !== 1 && (
          <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
            1 USD = {rate.toFixed(4)} {toCurrency}
          </p>
        )}
      </div>
    </div>
  );
}
