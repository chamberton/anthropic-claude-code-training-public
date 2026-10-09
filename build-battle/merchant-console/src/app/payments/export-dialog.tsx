"use client"

import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import {
  DEFAULT_EXPORT_COLUMNS,
  EXPORT_COLUMNS,
  ExportColumn,
} from "@/lib/csv"
import { Download } from "lucide-react"
import { useState } from "react"

const COLUMN_LABELS: Record<ExportColumn, string> = {
  id: "Payment ID",
  created_at: "Created (UTC)",
  merchant: "Merchant",
  description: "Description",
  status: "Status",
  method: "Method",
  card_brand: "Card brand",
  last4: "Card last four",
  amount: "Amount",
  currency: "Currency",
}

type Scope = "filter" | "all"

export function ExportDialog({
  query,
  filteredCount,
  totalCount,
}: {
  query: string
  filteredCount: number
  totalCount: number
}) {
  const [selected, setSelected] = useState<ExportColumn[]>([
    ...DEFAULT_EXPORT_COLUMNS,
  ])
  const [scope, setScope] = useState<Scope>("filter")
  const [open, setOpen] = useState(false)

  const toggle = (column: ExportColumn) =>
    setSelected((current) =>
      current.includes(column)
        ? current.filter((c) => c !== column)
        : EXPORT_COLUMNS.filter((c) => c === column || current.includes(c)),
    )

  const rowCount = scope === "all" ? totalCount : filteredCount

  const download = () => {
    const params = new URLSearchParams(scope === "all" ? "" : query)
    params.delete("page")
    params.set("columns", selected.join(","))
    params.set("scope", scope)
    window.location.href = `/api/payments/export?${params.toString()}`
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="w-full gap-2 py-1.5 sm:w-fit">
          <Download
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Export
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Export payments</DrawerTitle>
          <DrawerDescription>
            Choose what goes into the CSV before you download it.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-50">
              Scope
            </legend>
            {(
              [
                ["filter", "Current filter", filteredCount],
                ["all", "All payments", totalCount],
              ] as const
            ).map(([value, label, count]) => (
              <label
                key={value}
                htmlFor={`export-scope-${value}`}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  id={`export-scope-${value}`}
                  type="radio"
                  name="export-scope"
                  value={value}
                  checked={scope === value}
                  onChange={() => setScope(value)}
                  className="size-4 accent-blue-600"
                />
                {label}
                <span className="tabular-nums text-gray-500">
                  · {count.toLocaleString()} payments
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-50">
              Columns
            </legend>
            {EXPORT_COLUMNS.map((column) => (
              <label
                key={column}
                htmlFor={`export-col-${column}`}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  id={`export-col-${column}`}
                  type="checkbox"
                  checked={selected.includes(column)}
                  onChange={() => toggle(column)}
                  className="size-4 accent-blue-600"
                />
                {COLUMN_LABELS[column]}
              </label>
            ))}
          </fieldset>

          {selected.length === 0 && (
            <p role="status" className="text-sm text-amber-700 dark:text-amber-500">
              Select at least one column to download.
            </p>
          )}
        </DrawerBody>
        <DrawerFooter className="mt-6">
          <DrawerClose asChild>
            <Button variant="secondary" className="w-full sm:w-fit">
              Cancel
            </Button>
          </DrawerClose>
          <Button
            className="w-full sm:w-fit"
            disabled={selected.length === 0}
            onClick={download}
          >
            Download {rowCount.toLocaleString()} rows
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
