import { courseFeatures, prizes, ticketPacks } from "@/data/raffle";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function DescriptionSection() {
  return (
    <section className="bg-black py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="space-y-12">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-brand-red">
              Descripción
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Autoblack combina formación online de calidad con la emoción de
              participar en sorteos de vehículos 0km. Al adquirir cualquier pack
              de cursos, recibís chances automáticas para nuestro triple sorteo
              que incluye camioneta, motos y premios adicionales. Todo el
              proceso es transparente, auditado y transmitido en vivo.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-brand-red">
              ¿Qué incluyen los cursos?
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {courseFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-brand-red">
              Opciones de participación
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ticketPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-white">
                    {pack.chances}{" "}
                    {pack.chances === 1 ? "chance" : "chances"}
                  </span>
                  <span className="font-bold text-brand-red">
                    {formatPrice(pack.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-brand-red">
              Premios del triple sorteo
            </h2>
            <div className="mt-4 space-y-6">
              {prizes.map((prize) => (
                <div
                  key={prize.draw}
                  className="rounded-lg border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="font-black text-white">
                    {prize.draw}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      — {prize.date}
                    </span>
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {prize.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <span>🏆</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
