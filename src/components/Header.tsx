import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-brand-red py-1.5 text-center text-xs font-semibold tracking-wide text-white">
        🔥 TRIPLE SORTEO — Participá y ganá vehículos 0km
      </div>
      <nav className="border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-white">
              AUTO<span className="text-brand-red">BLACK</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="#finalizados"
              className="rounded border border-white/30 px-4 py-2 text-xs font-bold tracking-wider text-white transition hover:border-brand-red hover:text-brand-red"
            >
              FINALIZADOS
            </Link>
            <Link
              href="#cuenta"
              className="rounded bg-brand-red px-4 py-2 text-xs font-bold tracking-wider text-white transition hover:bg-brand-red-dark"
            >
              MI CUENTA
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
