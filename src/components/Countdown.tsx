"use client";

import { useEffect, useMemo, useState } from "react";

export const fallbackDrawAt = "2026-06-10T22:00:00-03:00";

function getTimeLeft(targetDate: Date) {
  const diff = Math.max(targetDate.getTime() - Date.now(), 0);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: diff === 0,
  };
}

export function formatDrawDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function CountdownItem({
  value,
  label,
  compact = false,
}: {
  value: number;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "min-w-12" : "min-w-20"}>
      <p
        className={
          compact
            ? "text-2xl font-black text-brand-red sm:text-3xl"
            : "text-4xl font-black text-brand-red sm:text-5xl"
        }
      >
        {String(value).padStart(2, "0")}
      </p>
      <p
        className={
          compact
            ? "mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400"
            : "mt-1 text-xs font-bold uppercase tracking-wider text-gray-400"
        }
      >
        {label}
      </p>
    </div>
  );
}

export default function Countdown({
  drawAt,
  compact = false,
}: {
  drawAt?: string | null;
  compact?: boolean;
}) {
  const targetDate = useMemo(() => new Date(drawAt || fallbackDrawAt), [drawAt]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      className={
        compact
          ? "flex items-center justify-center gap-2"
          : "flex flex-wrap items-center justify-center gap-3 sm:gap-6"
      }
    >
      <CountdownItem value={timeLeft.days} label="días" compact={compact} />
      <span
        className={
          compact
            ? "text-2xl font-black text-brand-red"
            : "hidden text-4xl font-black text-brand-red sm:block"
        }
      >
        :
      </span>
      <CountdownItem value={timeLeft.hours} label="horas" compact={compact} />
      <span
        className={
          compact
            ? "text-2xl font-black text-brand-red"
            : "hidden text-4xl font-black text-brand-red sm:block"
        }
      >
        :
      </span>
      <CountdownItem value={timeLeft.minutes} label="min" compact={compact} />
      <span
        className={
          compact
            ? "text-2xl font-black text-brand-red"
            : "hidden text-4xl font-black text-brand-red sm:block"
        }
      >
        :
      </span>
      <CountdownItem value={timeLeft.seconds} label="seg" compact={compact} />
    </div>
  );
}
