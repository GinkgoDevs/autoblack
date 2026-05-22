import Image from "next/image";
import { winners } from "@/data/raffle";

export default function WinnersSection() {
  return (
    <section className="bg-zinc-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-black uppercase text-white">
          ¡Ellos ya ganaron!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Conocé algunos de nuestros ganadores anteriores
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((winner) => (
            <article
              key={winner.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-black"
            >
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={winner.image}
                  alt={`${winner.name} ganó ${winner.prize}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white">{winner.name}</h3>
                <p className="text-sm text-gray-400">{winner.location}</p>
                <p className="mt-1 text-sm font-semibold text-brand-red">
                  🏆 {winner.prize}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            className="rounded-lg border border-white/30 px-8 py-3 text-sm font-bold tracking-wider text-white transition hover:border-brand-red hover:text-brand-red"
          >
            VER MÁS GANADORES
          </button>
        </div>
      </div>
    </section>
  );
}
