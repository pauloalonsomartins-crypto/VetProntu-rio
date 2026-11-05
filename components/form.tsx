"use client";

import { startTransition, useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export function ActionForm({
  action,
  children,
  submitLabel,
  className = "space-y-5",
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form
      method="post" // antes da hidratação, nunca enviar dados (ex.: senha) pela URL
      // Não usamos <form action> para o React não limpar os campos quando o servidor
      // devolve um erro de validação: numa consulta longa, o veterinário perderia o texto.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className={className}
    >
      {children}
      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60"
      >
        {pending ? "Salvando…" : submitLabel}
      </button>
    </form>
  );
}

const inputCls =
  "block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20";

export function Field({
  label,
  name,
  hint,
  children,
  className = "",
}: {
  label: string;
  name: string;
  hint?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-stone-800">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export function Input({ label, name, hint, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; hint?: string }) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <input id={name} name={name} className={inputCls} {...rest} />
    </Field>
  );
}

export function Textarea({ label, name, hint, rows = 3, className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; hint?: string }) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <textarea id={name} name={name} rows={rows} className={inputCls} {...rest} />
    </Field>
  );
}

export function Select({ label, name, options, hint, className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; hint?: string; options: Record<string, string> }) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <select id={name} name={name} className={inputCls} {...rest}>
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Linhas dinâmicas de receita (medicamentos). */
export function PrescriptionRows() {
  const [rows, setRows] = useState([0]);
  const [next, setNext] = useState(1);
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-stone-800">Receita</legend>
      {rows.map((id) => (
        <div key={id} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-6">
          <Input className="sm:col-span-3" label="Medicamento" name={`rx_medication_${id}`} />
          <Input className="sm:col-span-3" label="Dose" name={`rx_dose_${id}`} placeholder="ex.: 1 comprimido" />
          <Input className="sm:col-span-2" label="Frequência" name={`rx_frequency_${id}`} placeholder="ex.: a cada 12 h" />
          <Input className="sm:col-span-2" label="Duração" name={`rx_duration_${id}`} placeholder="ex.: 7 dias" />
          <Input className="sm:col-span-2" label="Instruções" name={`rx_instructions_${id}`} placeholder="ex.: com alimento" />
          {rows.length > 1 && (
            <button type="button" onClick={() => setRows(rows.filter((r) => r !== id))} className="text-left text-xs text-red-700 hover:underline sm:col-span-6">
              Remover medicamento
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows([...rows, next]);
          setNext(next + 1);
        }}
        className="text-sm font-medium text-teal-800 hover:underline"
      >
        + Adicionar medicamento
      </button>
    </fieldset>
  );
}
