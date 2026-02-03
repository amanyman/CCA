import { useState, useEffect } from 'react';

function getDailySeed() {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return pstDate.getFullYear() * 10000 + (pstDate.getMonth() + 1) * 100 + pstDate.getDate();
}

function seededRandom(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return Math.floor(random * (max - min + 1)) + min;
}

function getPeopleHelpedToday(): number {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

  const hours = pstDate.getHours();
  const minutes = pstDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const progressThroughDay = totalMinutes / (24 * 60);

  const seed = getDailySeed();
  const targetForToday = seededRandom(seed, 25, 55);

  const count = Math.max(1, Math.floor(1 + (targetForToday - 1) * progressThroughDay));

  return count;
}

export default function LiveActivityIndicator() {
  const [currentNumber, setCurrentNumber] = useState(() => getPeopleHelpedToday());

  useEffect(() => {
    const updateCount = () => {
      setCurrentNumber(getPeopleHelpedToday());
    };

    const interval = setInterval(updateCount, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200/60"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
        </div>
        <span className="text-sm font-medium text-slate-700">
          {currentNumber} people helped today
        </span>
      </div>
    </div>
  );
}
