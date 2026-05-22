import { formatCurrencyFromCents } from "@/lib/format";

type TicketOptionProps = {
  pack: {
    id: string;
    chances: number;
    price_cents: number;
    currency: string;
    badge: string | null;
  };
  selected: boolean;
  onSelect: (id: string) => void;
};

export default function TicketOption({
  pack,
  selected,
  onSelect,
}: TicketOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(pack.id)}
      className={`relative flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 transition ${
        selected
          ? "border-brand-red bg-brand-red/10"
          : "border-white/15 bg-white/5 hover:border-white/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            selected ? "border-brand-red" : "border-white/40"
          }`}
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-red" />}
        </span>
        <div className="text-left">
          <span className="font-bold text-white">
            {pack.chances} {pack.chances === 1 ? "chance" : "chances"}
          </span>
          {pack.badge && (
            <span className="ml-2 rounded bg-brand-red px-1.5 py-0.5 text-[10px] font-bold text-white">
              {pack.badge}
            </span>
          )}
        </div>
      </div>
      <span className="text-lg font-black text-brand-red">
        {formatCurrencyFromCents(pack.price_cents, pack.currency)}
      </span>
    </button>
  );
}
