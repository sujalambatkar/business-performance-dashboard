import Papa from "papaparse";

export interface DailyRow {
  date: string;
  leads: number;
  calls: number;
  website_visits: number;
  revenue: number;
}

export interface ParseResult {
  rows: DailyRow[];
  skippedRowCount: number;
  skippedRowDetails: string[];
}

// Accepts flexible header casing/spacing, e.g. "Website Visits", "website_visits", "WEBSITE-VISITS"
const REQUIRED_FIELDS = ["date", "leads", "calls", "website_visits", "revenue"] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function buildHeaderMap(headers: string[]): Partial<Record<RequiredField, string>> {
  const map: Partial<Record<RequiredField, string>> = {};
  for (const raw of headers) {
    const normalized = normalizeHeader(raw);
    if ((REQUIRED_FIELDS as readonly string[]).includes(normalized)) {
      map[normalized as RequiredField] = raw;
    }
  }
  return map;
}

export class CsvValidationError extends Error {
  missingColumns?: string[];
  constructor(message: string, missingColumns?: string[]) {
    super(message);
    this.name = "CsvValidationError";
    this.missingColumns = missingColumns;
  }
}

export function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      reject(new CsvValidationError("Only .csv files are supported."));
      return;
    }

    if (file.size === 0) {
      reject(new CsvValidationError("The uploaded file is empty."));
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const fields = results.meta.fields ?? [];
          if (fields.length === 0 || (results.data.length === 0 && results.errors.length > 0)) {
            reject(new CsvValidationError("The file could not be read as a CSV, or it has no data rows."));
            return;
          }

          const headerMap = buildHeaderMap(fields);
          const missing = REQUIRED_FIELDS.filter((f) => !headerMap[f]);
          if (missing.length > 0) {
            reject(
              new CsvValidationError(
                `Missing required column(s): ${missing.join(", ")}.`,
                missing
              )
            );
            return;
          }

          if (results.data.length === 0) {
            reject(new CsvValidationError("The CSV has headers but no data rows."));
            return;
          }

          const rows: DailyRow[] = [];
          const skippedRowDetails: string[] = [];

          results.data.forEach((rawRow, index) => {
            const rowNumber = index + 2; // +1 for header row, +1 for 1-indexing
            const dateVal = rawRow[headerMap.date!]?.trim();
            const leadsVal = rawRow[headerMap.leads!]?.trim();
            const callsVal = rawRow[headerMap.calls!]?.trim();
            const visitsVal = rawRow[headerMap.website_visits!]?.trim();
            const revenueVal = rawRow[headerMap.revenue!]?.trim();

            if (!dateVal || !leadsVal || !callsVal || !visitsVal || !revenueVal) {
              skippedRowDetails.push(`Row ${rowNumber}: missing value(s)`);
              return;
            }

            const leads = Number(leadsVal);
            const calls = Number(callsVal);
            const website_visits = Number(visitsVal);
            const revenue = Number(revenueVal);

            if ([leads, calls, website_visits, revenue].some((n) => Number.isNaN(n))) {
              skippedRowDetails.push(`Row ${rowNumber}: non-numeric value in a numeric column`);
              return;
            }

            rows.push({ date: dateVal, leads, calls, website_visits, revenue });
          });

          if (rows.length === 0) {
            reject(
              new CsvValidationError(
                "No valid data rows found after validation. Check that leads, calls, website_visits, and revenue are numeric."
              )
            );
            return;
          }

          resolve({
            rows,
            skippedRowCount: skippedRowDetails.length,
            skippedRowDetails,
          });
        } catch (err) {
          reject(
            new CsvValidationError(
              err instanceof Error ? err.message : "Unknown error while parsing the CSV."
            )
          );
        }
      },
      error: (err: Error) => {
        reject(new CsvValidationError(err.message || "Failed to parse the CSV file."));
      },
    });
  });
}
