export function downloadSampleCsv() {
  const header = "date,leads,calls,website_visits,revenue";
  const rows = [
    "2026-07-01,12,20,600,2400",
    "2026-07-02,15,18,720,3100",
    "2026-07-03,9,14,540,1800",
    "2026-07-04,20,25,850,4200",
    "2026-07-05,17,22,780,3600",
    "2026-07-06,11,16,610,2200",
    "2026-07-07,22,30,900,4800",
  ];
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sample-business-data.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
