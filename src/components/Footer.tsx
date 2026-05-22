import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <span className="text-2xl font-black tracking-tighter text-white">
            AUTO<span className="text-brand-red">BLACK</span>
          </span>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Av. Corrientes 1234
            <br />
            CABA, Buenos Aires
            <br />
            +54 11 1234-5678
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black tracking-wider text-white">
            NUESTRAS REDES
          </h3>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="#"
              className="text-sm text-gray-400 transition hover:text-brand-red"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-400 transition hover:text-brand-red"
            >
              YouTube
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-400 transition hover:text-brand-red"
            >
              WhatsApp
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black tracking-wider text-white">
            BOTÓN DE ARREPENTIMIENTO
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Tenés derecho a revocar la compra dentro de los 10 días
            corridos desde la fecha de adquisición, según la Ley 24.240 de
            Defensa del Consumidor.
          </p>
          <Link
            href="#"
            className="mt-3 inline-block text-sm font-semibold text-brand-red hover:underline"
          >
            Ejercer derecho de arrepentimiento
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Autoblack. Todos los derechos reservados.
      </div>
    </footer>
  );
}
