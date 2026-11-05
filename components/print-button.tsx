"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-stone-100">
      🖨 Imprimir
    </button>
  );
}
