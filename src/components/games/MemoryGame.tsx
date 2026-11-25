import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { RotateCcw, Sparkles } from "lucide-react";
import type { MemoryPairData } from "../../types/lesson";
import { soundFx } from "../../utils/soundFx";

interface MemoryGameProps {
  pairs: MemoryPairData[];
}

interface CardNode {
  uid: string;
  pairId: string;
  kind: "term" | "match";
  text: string;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ pairs }) => {
  const usablePairs = useMemo(() => pairs.slice(0, 6), [pairs]);

  const [cards, setCards] = useState<CardNode[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const initCards = () => {
    const deck: CardNode[] = [];
    usablePairs.forEach((p) => {
      deck.push({ uid: `${p.id}_t`, pairId: p.id, kind: "term", text: p.term });
      deck.push({ uid: `${p.id}_m`, pairId: p.id, kind: "match", text: p.match });
    });
    setCards(deck.sort(() => Math.random() - 0.5));
    setFlippedUids([]);
    setMatchedPairIds([]);
    setMoves(0);
    setLocked(false);
  };

  useEffect(() => {
    initCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usablePairs]);

  const handleFlip = (card: CardNode) => {
    if (locked) return;
    if (flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId)) return;

    soundFx.playFlip();
    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [firstUid, secondUid] = nextFlipped;
      const firstCard = cards.find((c) => c.uid === firstUid);
      const secondCard = cards.find((c) => c.uid === secondUid);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        setTimeout(() => {
          const updatedMatched = [...matchedPairIds, firstCard.pairId];
          setMatchedPairIds(updatedMatched);
          setFlippedUids([]);
          setLocked(false);
          if (updatedMatched.length === usablePairs.length) {
            soundFx.playFanfare();
          } else {
            soundFx.playSuccess();
          }
        }, 380);
      } else {
        setTimeout(() => {
          soundFx.playError();
          setFlippedUids([]);
          setLocked(false);
        }, 850);
      }
    }
  };

  const isComplete = usablePairs.length > 0 && matchedPairIds.length === usablePairs.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            Xotira juftligi (3D Kartalar)
          </h3>
          <p className="text-xs text-slate-500">
            Atama va unga mos izoh kartalarini ochib juftliklarni toping
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            Juftliklar: {matchedPairIds.length}/{usablePairs.length} · Urinishlar: {moves}
          </span>
          <button
            type="button"
            onClick={initCards}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Aralashtirish</span>
          </button>
        </div>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-950">
                Zo'r xotira! Barcha juftliklar {moves} ta urinishda topildi!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={initCards}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
          >
            Qayta o'ynash
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {cards.map((card, idx) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isRevealed = isMatched || flippedUids.includes(card.uid);

          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card)}
              className="perspective-1000 h-32 sm:h-36 w-full cursor-pointer focus:outline-none"
            >
              <div
                className={`relative w-full h-full transition-transform duration-300 transform-style-3d ${
                  isRevealed ? "rotate-y-180" : ""
                }`}
              >
                {/* Card Back */}
                <div className="absolute inset-0 backface-hidden rounded-xl border border-slate-300 bg-slate-900 text-white flex flex-col items-center justify-center p-3 hover:bg-slate-800 transition-colors">
                  <span className="font-mono text-xs text-blue-300 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Ochish</span>
                </div>

                {/* Card Front */}
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl border p-3.5 flex flex-col items-center justify-center text-center ${
                    isMatched
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                      : card.kind === "term"
                      ? "bg-blue-50 border-blue-400 text-blue-950"
                      : "bg-white border-slate-300 text-slate-800"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">
                    {card.kind === "term" ? "Atama" : "Izoh"}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold leading-snug line-clamp-4">
                    {card.text}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
