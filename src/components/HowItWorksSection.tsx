const steps = [
  {
    number: 1,
    title: "ELEGÍ TU PACK",
    description: "Seleccioná la cantidad de chances que querés comprar.",
  },
  {
    number: 2,
    title: "PAGÁ TU PACK",
    description: "Completá el pago con tarjeta, Mercado Pago o transferencia.",
  },
  {
    number: 3,
    title: "RECIBÍ TU NÚMERO",
    description: "Te enviamos tus números de sorteo por WhatsApp al instante.",
  },
  {
    number: 4,
    title: "MIRÁ EL SORTEO",
    description: "Seguí la transmisión en vivo y descubrí si ganaste.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-black py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-black uppercase text-white">
          ¿Cómo funciona?
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-red text-2xl font-black text-brand-red">
                {step.number}
              </div>
              <h3 className="mt-4 text-sm font-black tracking-wider text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-4 text-center text-xs text-gray-400">
          Al comprar un pack de cursos recibís chances para el sorteo de forma
          automática. Los números se asignan al azar y se envían por WhatsApp.
          Sorteo auditado y transmitido en vivo por Instagram y YouTube.
        </div>
      </div>
    </section>
  );
}
