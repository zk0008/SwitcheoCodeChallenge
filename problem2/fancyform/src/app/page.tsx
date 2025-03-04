// app/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { ArrowDown, RefreshCw, AlertCircle } from "react-feather";

interface TokenPrice {
  currency: string;
  price: number;
  date: string;
}

export default function SwapForm() {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [fromToken, setFromToken] = useState("SWTH");
  const [toToken, setToToken] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isOpen, setIsOpen] = useState<"from" | "to" | null>(null);
  const [error, setError] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    fetch("https://interview.switcheo.com/prices.json")
      .then((res) => res.json())
      .then((data) => setTokens(data.filter((t: TokenPrice) => t.price)));
  }, []);

  const calculateRate = () => {
    if (!fromAmount || isNaN(Number(fromAmount))) return;

    const fromPrice = tokens.find((t) => t.currency === fromToken)?.price;
    const toPrice = tokens.find((t) => t.currency === toToken)?.price;

    if (!fromPrice || !toPrice) {
      setError("Selected token pair not tradable");
      return;
    }

    const result = (Number(fromAmount) * fromPrice) / toPrice;
    setToAmount(result.toFixed(4));
    setError("");
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    calculateRate();
  };

  const handleSubmit = async () => {
    setIsSwapping(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert(
      `Successfully swapped ${fromAmount} ${fromToken} to ${toAmount} ${toToken}`
    );
    setIsSwapping(false);
  };

  const handleInputChange = (value: string) => {
    if (isNaN(Number(value))) {
      setError("Please enter a valid number");
      return;
    }
    setFromAmount(value);
    calculateRate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-pink to-purple-300 flex items-center justify-center p-4">
      <div className="bg-custompink rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
        <h1 className="text-5xl font-bold text-teal-950 text-center">
          Swap Tokens
        </h1>

        {/* From Token Card */}
        <div className="bg-slate-100 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between mb-3">
            <span className="text-lg text-teal-950">From</span>
            <button
              className="text-sm text-teal-800 hover:text-teal-950"
              onClick={() => setIsOpen("from")}
            >
              Balance: 1000
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="0"
              className="bg-transparent text-xl w-full outline-none text-teal-950"
            />
            <TokenSelector
              token={fromToken}
              onClick={() => setIsOpen("from")}
            />
          </div>
        </div>

        {/* Switch Button */}
        <button
          onClick={switchTokens}
          className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-purple-400 hover:bg-purple-800 text-white shadow-lg transform transition-all hover:-translate-y-0.5"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* To Token Card */}
        <div className="bg-slate-100 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between mb-3">
            <span className="text-lg text-teal-950">To</span>
            <button
              className="text-sm text-teal-800 hover:text-teal-950"
              onClick={() => setIsOpen("to")}
            >
              Balance: 1000
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="bg-transparent text-xl w-full outline-none text-teal-950"
            />
            <TokenSelector token={toToken} onClick={() => setIsOpen("to")} />
          </div>
        </div>

        {/* Error/Info Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg z-50 relative">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSubmit}
          disabled={!fromAmount || !!error || isSwapping}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-800 hover:to-blue-800 disabled:opacity-50 text-white rounded-xl py-4 font-medium transition-all flex items-center justify-center"
        >
          {isSwapping ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : error ? (
            error
          ) : (
            "Swap Now"
          )}
        </button>

        <TokenModal
          isOpen={isOpen !== null}
          onClose={() => setIsOpen(null)}
          tokens={tokens}
          onSelect={(token) => {
            if (isOpen === "from") setFromToken(token);
            else setToToken(token);
            setIsOpen(null);
            calculateRate();
          }}
        />
      </div>
    </div>
  );
}

const TokenSelector = ({
  token,
  onClick,
}: {
  token: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="text-teal-950 flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
  >
    <img
      src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`}
      alt={token}
      className="w-6 h-6 rounded-full"
      onError={(e) => (e.currentTarget.src = "/generic-token.png")}
    />
    <span className="font-medium">{token}</span>
    <ArrowDown className="w-4 h-4 text-gray-500" />
  </button>
);

const TokenModal = ({
  isOpen,
  onClose,
  tokens,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  tokens: TokenPrice[];
  onSelect: (token: string) => void;
}) => (
  <Dialog
    open={isOpen}
    onClose={onClose}
    className="fixed inset-0 z-10 overflow-y-auto"
  >
    {/* Overlay */}
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

    {/* Modal Container */}
    <div className="flex items-center justify-center min-h-screen p-4">
      <DialogPanel className="relative bg-white rounded-2xl max-w-xs w-full mx-4 p-6">
        <h3 className="text-lg text-teal-950 font-medium mb-4">Select Token</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tokens.map((token) => (
            <button
              key={token.currency}
              onClick={() => onSelect(token.currency)}
              className="flex text-teal-950 items-center w-full p-3 hover:bg-gray-50 rounded-lg gap-3"
            >
              <img
                src={`https://raw.githubusercontent.com/Switcheo/token-icons/refs/heads/main/tokens/${token.currency}.svg`}
                alt={token.currency}
                className="w-8 h-8 rounded-full"
                onError={(e) => (e.currentTarget.src = "/generic-token.png")}
              />
              <div>
                <p className="font-medium text-left">{token.currency}</p>
                <p className="text-sm text-gray-500">
                  ${token.price.toFixed(4)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogPanel>
    </div>
  </Dialog>
);
