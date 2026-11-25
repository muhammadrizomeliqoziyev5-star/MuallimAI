import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { RotateCw, Eye, Plus, RotateCcw } from "lucide-react";
import type { WheelChallengeData } from "../../types/lesson";
import { soundFx } from "../../utils/soundFx";

interface WheelGameProps {
  segments: WheelChallengeData[];
}

const SLICE_COLORS = [
  "#1D4ED8",
  "#0F172A",
  "#047857",
  "#B45309",
  "#1E40AF",
  "#334155",
  "#065F46",
  "#9A3412",
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArcSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    cx,
    cy,
    "L",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}

export const WheelGame: React.FC<WheelGameProps> = ({ segments }) => {
  const slices = useMemo(() => segments.slice(0, 8), [segments]);
  const sliceCount = slices.length;
  const sliceAngle = sliceCount > 0 ? 360 / sliceCount : 45;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<WheelChallengeData | null>(null);
  const [showHint, setShowHint] = useState(false);

  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [teamScores, setTeamScores] = useState<{ 1: number; 2: number }>({ 1: 0, 2: 0 });
  const [awarded, setAwarded] = useState(false);

  const handleSpin = () => {
    if (spinning || sliceCount === 0) return;
    setSpinning(true);
    setActiveChallenge(null);
    setShowHint(false);
    setAwarded(false);

    const chosenIdx = Math.floor(Math.random() * sliceCount);
    // Calculate target rotation so chosenIdx center lands under the 0-deg top pointer
    const sliceCenterAngle = chosenIdx * sliceAngle + sliceAngle / 2;
    const targetNormalized = (360 - sliceCenterAngle) % 360;
    const currentNormalized = rotation % 360;
    const delta = (targetNormalized - currentNormalized + 360) % 360;
    const extraSpins = 360 * 5;
    const nextRotation = rotation + extraSpins + delta;

    setRotation(nextRotation);

    // Play ticking sound sequence
    let ticks = 0;
    const tickTimer = setInterval(() => {
      ticks++;
      soundFx.playTick();
      if (ticks >= 16) clearInterval(tickTimer);
    }, 170);

    setTimeout(() => {
      clearInterval(tickTimer);
      setSpinning(false);
      setActiveChallenge(slices[chosenIdx]);
      soundFx.playSuccess();
    }, 3200);
  };

  const handleAwardPoints = () => {
    if (!activeChallenge || awarded) return;
    setTeamScores((prev) => ({
      ...prev,
      [activeTeam]: prev[activeTeam] + activeChallenge.points,
    }));
    setAwarded(true);
    soundFx.playSnap();
    setActiveTeam((t) => (t === 1 ? 2 : 1));
  };

  if (sliceCount === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            Omad charxi — Jamoaviy sinf bellashuvi
          </h3>
          <p className="text-xs text-slate-500">
            Navbatdagi jamoani tanlang va charxni aylantiring
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTeamScores({ 1: 0, 2: 0 });
            setActiveChallenge(null);
            setAwarded(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hisobni nolga tushirish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: SVG Spinning Wheel */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-6">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80">
            {/* Top Pointer */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow" />

            <motion.svg
              viewBox="0 0 320 320"
              className="w-full h-full drop-shadow-sm"
              animate={{ rotate: rotation }}
              transition={{ duration: 3.1, ease: [0.15, 0.85, 0.25, 1] }}
            >
              {slices.map((seg, idx) => {
                const startA = idx * sliceAngle;
                const endA = startA + sliceAngle;
                const midA = startA + sliceAngle / 2;
                const textPos = polarToCartesian(160, 160, 102, midA);

                return (
                  <g key={idx}>
                    <path
                      d={describeArcSlice(160, 160, 152, startA, endA)}
                      fill={SLICE_COLORS[idx % SLICE_COLORS.length]}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midA - 90}, ${textPos.x}, ${textPos.y})`}
                    >
                      {seg.label.length > 13 ? `${seg.label.slice(0, 12)}…` : seg.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="160" cy="160" r="24" fill="#ffffff" stroke="#0F172A" strokeWidth="3" />
            </motion.svg>
          </div>

          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning}
            className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
            <span>{spinning ? "Aylanmoqda..." : "Charxni aylantirish"}</span>
          </button>
        </div>

        {/* Right: Team Scoreboard & Active Challenge */}
        <div className="lg:col-span-6 space-y-5">
          {/* Team Switch & Scoreboard */}
          <div className="grid grid-cols-2 gap-3">
            {([1, 2] as const).map((teamNum) => {
              const isSelected = activeTeam === teamNum;
              return (
                <button
                  key={teamNum}
                  type="button"
                  onClick={() => setActiveTeam(teamNum)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-900 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      isSelected ? "text-blue-300" : "text-slate-500"
                    }`}
                  >
                    {teamNum}-jamoa {isSelected ? "· Navbatda" : ""}
                  </p>
                  <p className="font-display text-3xl font-bold tabular-nums mt-1">
                    {teamScores[teamNum]} ball
                  </p>
                </button>
              );
            })}
          </div>

          {/* Landed Challenge Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[220px] flex flex-col justify-between">
            {activeChallenge ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-blue-700">
                    {activeChallenge.label}
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    +{activeChallenge.points} ball
                  </span>
                </div>

                <p className="font-display text-lg font-bold text-slate-900 leading-snug">
                  {activeChallenge.challenge}
                </p>

                {showHint && (
                  <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    Javob ishorasi: {activeChallenge.answerHint}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHint((h) => !h)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showHint ? "Ishorani yashirish" : "Javob ishorasi"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAwardPoints}
                    disabled={awarded}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {awarded
                        ? "Ball qo'shildi"
                        : `${activeTeam}-jamoaga +${activeChallenge.points} ball`}
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-sm text-slate-500">
                <p>
                  {spinning
                    ? "Sektor aniqlanmoqda..."
                    : "Topshiriqni ochish uchun charxni aylantiring."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
