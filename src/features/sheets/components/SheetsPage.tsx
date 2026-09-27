import {
  AlignLeft,
  Bold,
  ChevronDown,
  Download,
  Filter,
  Italic,
  MoreHorizontal,
  Plus,
  Printer,
  Redo2,
  Save,
  Search,
  Sigma,
  Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type SheetCell = {
  value: string;
  variant?: "header" | "currency" | "percent" | "muted" | "success";
};

const columns = ["A", "B", "C", "D", "E", "F", "G", "H"];

const rows: SheetCell[][] = [
  [
    { value: "Lead", variant: "header" },
    { value: "Company", variant: "header" },
    { value: "Stage", variant: "header" },
    { value: "Owner", variant: "header" },
    { value: "Value", variant: "header" },
    { value: "Probability", variant: "header" },
    { value: "Close date", variant: "header" },
    { value: "Notes", variant: "header" },
  ],
  [
    { value: "Product analytics" },
    { value: "Northstar Labs" },
    { value: "Proposal" },
    { value: "Asha" },
    { value: "$42,500", variant: "currency" },
    { value: "72%", variant: "percent" },
    { value: "Jun 18" },
    { value: "Legal review pending", variant: "muted" },
  ],
  [
    { value: "Workflow audit" },
    { value: "PilotDesk" },
    { value: "Discovery" },
    { value: "Ravi" },
    { value: "$18,900", variant: "currency" },
    { value: "38%", variant: "percent" },
    { value: "Jul 02" },
    { value: "Needs security checklist", variant: "muted" },
  ],
  [
    { value: "Inbox automation" },
    { value: "Clearbit Works" },
    { value: "Negotiation" },
    { value: "Meera" },
    { value: "$64,000", variant: "currency" },
    { value: "84%", variant: "percent" },
    { value: "Jun 27" },
    { value: "Pricing approved", variant: "success" },
  ],
  [
    { value: "Hiring dashboard" },
    { value: "Vector Studio" },
    { value: "Qualified" },
    { value: "Dev" },
    { value: "$31,200", variant: "currency" },
    { value: "55%", variant: "percent" },
    { value: "Jul 11" },
    { value: "Waiting on data sample", variant: "muted" },
  ],
  [
    { value: "CRM migration" },
    { value: "Orbit Systems" },
    { value: "Closed won" },
    { value: "Asha" },
    { value: "$95,400", variant: "currency" },
    { value: "100%", variant: "percent" },
    { value: "Jun 07" },
    { value: "Kickoff scheduled", variant: "success" },
  ],
  [
    { value: "Support insights" },
    { value: "Tandem AI" },
    { value: "Demo" },
    { value: "Ravi" },
    { value: "$27,600", variant: "currency" },
    { value: "44%", variant: "percent" },
    { value: "Jul 19" },
    { value: "Follow up after trial", variant: "muted" },
  ],
  [
    { value: "Renewal forecast" },
    { value: "Summit Cloud" },
    { value: "Proposal" },
    { value: "Meera" },
    { value: "$58,100", variant: "currency" },
    { value: "68%", variant: "percent" },
    { value: "Aug 01" },
    { value: "Finance requested export", variant: "muted" },
  ],
  [
    { value: "Partner portal" },
    { value: "Keystone Group" },
    { value: "Discovery" },
    { value: "Dev" },
    { value: "$22,000", variant: "currency" },
    { value: "29%", variant: "percent" },
    { value: "Aug 14" },
    { value: "Map integration scope", variant: "muted" },
  ],
];

const emptyRows: SheetCell[][] = Array.from({ length: 8 }, () =>
  columns.map(() => ({ value: "" })),
);

const spreadsheetRows = [...rows, ...emptyRows];

export function SheetsPage() {
  const [selectedCell, setSelectedCell] = useState({ row: 1, column: 0 });
  const selectedAddress = `${columns[selectedCell.column]}${selectedCell.row + 1}`;
  const selectedValue =
    spreadsheetRows[selectedCell.row]?.[selectedCell.column]?.value ?? "";

  const totals = useMemo(() => {
    const pipeline = rows.slice(1).reduce((total, row) => {
      const value = Number(row[4].value.replace(/[$,]/g, ""));
      return total + value;
    }, 0);

    const weighted = rows.slice(1).reduce((total, row) => {
      const value = Number(row[4].value.replace(/[$,]/g, ""));
      const probability = Number(row[5].value.replace("%", "")) / 100;
      return total + value * probability;
    }, 0);

    return {
      pipeline: pipeline.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
      weighted: weighted.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    };
  }, []);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <section className="border-b px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              Sales pipeline
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              UI-only spreadsheet workspace for planning and review
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:w-[560px]">
            <Metric label="Rows" value={(rows.length - 1).toString()} />
            <Metric label="Pipeline" value={totals.pipeline} />
            <Metric label="Weighted" value={totals.weighted} />
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/20 px-4 py-2 md:px-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <ToolbarButton label="Undo" icon={Undo2} />
          <ToolbarButton label="Redo" icon={Redo2} />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton label="Save" icon={Save} />
          <ToolbarButton label="Print" icon={Printer} />
          <ToolbarButton label="Download" icon={Download} />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="outline" size="sm" className="h-8 gap-2">
            Arial
            <ChevronDown className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            12
            <ChevronDown className="size-3.5" />
          </Button>
          <ToolbarButton label="Bold" icon={Bold} />
          <ToolbarButton label="Italic" icon={Italic} />
          <ToolbarButton label="Align" icon={AlignLeft} />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton label="Filter" icon={Filter} />
          <ToolbarButton label="Formula" icon={Sigma} />
          <ToolbarButton label="More" icon={MoreHorizontal} />
        </div>
      </section>

      <section className="border-b px-4 py-2 md:px-6">
        <div className="grid gap-2 md:grid-cols-[96px_minmax(0,1fr)_260px]">
          <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
            {selectedAddress}
          </div>
          <div className="flex h-9 min-w-0 items-center rounded-md border bg-background">
            <div className="flex h-full w-10 items-center justify-center border-r text-sm font-semibold">
              fx
            </div>
            <div className="truncate px-3 text-sm text-muted-foreground">
              {selectedValue || "Select a cell to preview its value"}
            </div>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search sheet" className="h-9 pl-9" />
          </div>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="min-w-[1060px]">
            <div className="grid grid-cols-[48px_repeat(8,minmax(120px,1fr))] border-b bg-muted/40 text-xs font-medium text-muted-foreground">
              <div className="sticky left-0 z-20 border-r bg-muted/40 px-2 py-2" />
              {columns.map((column) => (
                <div key={column} className="border-r px-3 py-2 text-center">
                  {column}
                </div>
              ))}
            </div>

            {spreadsheetRows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[48px_repeat(8,minmax(120px,1fr))] border-b text-sm"
              >
                <div className="sticky left-0 z-10 border-r bg-muted/30 px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                  {rowIndex + 1}
                </div>
                {row.map((cell, columnIndex) => (
                  <button
                    key={`${rowIndex}-${columnIndex}`}
                    type="button"
                    onClick={() =>
                      setSelectedCell({ row: rowIndex, column: columnIndex })
                    }
                    className={`min-h-10 border-r px-3 py-2 text-left transition-colors hover:bg-accent ${
                      selectedCell.row === rowIndex &&
                      selectedCell.column === columnIndex
                        ? "bg-primary/10 ring-2 ring-inset ring-primary"
                        : cell.variant === "header"
                          ? "bg-muted/60 font-semibold"
                          : "bg-background"
                    } ${getCellClassName(cell.variant)}`}
                  >
                    <span className="block truncate">{cell.value}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t bg-background px-4 py-2 text-xs text-muted-foreground md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="h-7">
            Pipeline
          </Button>
          <Button variant="ghost" size="sm" className="h-7">
            Forecast
          </Button>
          <Button variant="ghost" size="icon" className="size-7">
            <Plus className="size-4" />
          </Button>
        </div>
        <span>Selected {selectedAddress}</span>
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function ToolbarButton({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Undo2;
}) {
  return (
    <Button variant="ghost" size="icon" className="size-8" title={label}>
      <Icon className="size-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

function getCellClassName(variant: SheetCell["variant"]) {
  if (variant === "currency" || variant === "percent") {
    return "text-right tabular-nums";
  }

  if (variant === "muted") {
    return "text-muted-foreground";
  }

  if (variant === "success") {
    return "font-medium text-emerald-700";
  }

  return "";
}
