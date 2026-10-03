import React, { useState } from "react";
import { IoCalculatorOutline } from "react-icons/io5";
import { formatPrice } from "./format";

function MortgageCalculator({ price }) {
  const [downPct, setDownPct] = useState(20);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(5.5);

  const loanAmount = price * (1 - downPct / 100);
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  const monthly =
    monthlyRate === 0
      ? loanAmount / numPayments
      : (loanAmount * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -numPayments));

  return (
    <div className="mt-6 pt-5 border-t border-accent-500/10">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-main mb-4">
        <IoCalculatorOutline className="w-4 h-4 text-accent-500" />
        Mortgage calculator
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-secondary/70 mb-1.5">
            <span>Down payment</span>
            <span className="font-medium text-main">{downPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="w-full accent-accent-500"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-secondary/70 mb-1.5">
            <span>Loan term</span>
            <span className="font-medium text-main">{years} years</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-accent-500"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-secondary/70 mb-1.5">
            <span>Interest rate</span>
            <span className="font-medium text-main">{rate}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.25}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-accent-500"
          />
        </div>
        <div className="bg-accent-500/5 rounded-[16px] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary/70">Estimated monthly payment</p>
            <p className="text-xl font-bold text-accent-500">
              {formatPrice(Math.round(monthly))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary/70">Loan amount</p>
            <p className="text-sm font-semibold text-main">
              {formatPrice(Math.round(loanAmount))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MortgageCalculator;