import { filterPayments, parseFilters, sortPayments } from "@/data/queries"
import { exportFilename, parseExportColumns, toCsv } from "@/lib/csv"
import { NextRequest, NextResponse } from "next/server"

/**
 * Exports payments as CSV. `columns` is validated against the allowlist,
 * `scope=all` drops the active filters, and both paths use the one query builder.
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const columns = parseExportColumns(params.get("columns"))
  if (columns.length === 0) {
    return NextResponse.json(
      { error: "Choose at least one column to export." },
      { status: 400 },
    )
  }

  const scopeAll = params.get("scope") === "all"
  const filters = parseFilters(scopeAll ? new URLSearchParams() : params)
  const rows = sortPayments(
    filterPayments(filters),
    filters.sort,
    filters.direction,
  )

  const label = scopeAll
    ? "all"
    : filters.status && filters.status !== "all"
      ? filters.status
      : "filtered"

  return new Response(toCsv(rows, columns), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${exportFilename(new Date(), label)}"`,
    },
  })
}
