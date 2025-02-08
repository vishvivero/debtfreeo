
import { motion } from "framer-motion";
import { ScoreDetails, getScoreCategory } from "@/lib/utils/scoring/debtScoreCalculator";

interface CircularProgressProps {
  scoreDetails: ScoreDetails;
}

export const CircularProgress = ({ scoreDetails }: CircularProgressProps) => {
  const scoreCategory = getScoreCategory(scoreDetails.totalScore);

  return (
    <div className="relative w-64 h-64">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
        <div className="text-6xl font-bold text-gray-900">
          {Math.round(scoreDetails.totalScore)}
        </div>
        <div className="text-emerald-500 font-medium text-lg">
          {scoreCategory?.label}
        </div>
      </div>
      <svg className="w-full h-full transform -rotate-90">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="75%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle
          cx="128"
          cy="128"
          r="116"
          stroke="currentColor"
          strokeWidth="16"
          fill="none"
          className="text-gray-100"
        />
        <motion.circle
          initial={{ strokeDasharray: 729, strokeDashoffset: 729 }}
          animate={{ strokeDashoffset: 729 - (729 * scoreDetails.totalScore) / 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx="128"
          cy="128"
          r="116"
          stroke="url(#scoreGradient)"
          strokeWidth="16"
          fill="none"
          strokeDasharray="729"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
};
