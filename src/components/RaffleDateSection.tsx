"use client";

import Countdown, { fallbackDrawAt, formatDrawDate } from "./Countdown";

type RaffleDateSectionProps = {
  drawAt?: string | null;
};

export default function RaffleDateSection({ drawAt }: RaffleDateSectionProps) {
  const targetDate = new Date(drawAt || fallbackDrawAt);
  const formattedDate = formatDrawDate(targetDate);

  return (
    <section className="border-y border-white/10 bg-zinc-950 py-12">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="mb-4 text-4xl">📅</div>
        <h2 className="text-sm font-bold tracking-[0.3em] text-brand-red">
          FECHA DEL SORTEO
        </h2>
        <p className="mt-4 text-2xl font-black uppercase text-white sm:text-3xl">
          {formattedDate}
        </p>
        <p className="mt-2 text-xl font-bold text-gray-300">
          Cierra en
        </p>
        <div className="mt-8">
          <Countdown drawAt={drawAt} />
        </div>
        <button
          type="button"
          className="mt-8 rounded-lg border-2 border-brand-red px-8 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-brand-red/10"
        >
          VER PREMIOS EN VIVO
        </button>
      </div>
    </section>
  );
}
