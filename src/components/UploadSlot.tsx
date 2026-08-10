"use client";

import { useRef, useState } from "react";
import { parseCsvFile, DailyRow, CsvValidationError } from "@/lib/csvParser";

interface UploadSlotProps {
  label: string;
  onParsed: (rows: DailyRow[], fileName: string) => void;
  onClear: () => void;
}

export default function UploadSlot({ label, onParsed, onClear }: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError("");
    setWarning("");

    if (!file) return;

    try {
      const result = await parseCsvFile(file);
      setFileName(file.name);
      onParsed(result.rows, file.name);

      if (result.skippedRowCount > 0) {
        setWarning(
          `${result.skippedRowCount} row(s) were skipped due to missing or invalid values.`
        );
      }
    } catch (err) {
      setFileName("");
      onClear();
      if (err instanceof CsvValidationError) {
        setError(err.message);
      } else {
        setError("Something went wrong while reading this file. Please check the format and try again.");
      }
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    setFileName("");
    setError("");
    setWarning("");
    onClear();
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
          Choose CSV file
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {fileName && (
          <span className="flex items-center gap-2 text-sm text-slate-600">
            {fileName}
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-medium text-slate-400 hover:text-red-600"
            >
              Remove
            </button>
          </span>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}
      {warning && !error && (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">{warning}</p>
      )}
    </div>
  );
}
