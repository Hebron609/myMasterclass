"use client";
import { cardClass } from "./ApiUI";
export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function records(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.map(record) : [];
}
const label = (key: string) =>
  key.replaceAll("_", " ").replace(/\b\w/g, (value) => value.toUpperCase());
export function MetricCards({ value }: { value: unknown }) {
  const metrics = Object.entries(record(value)).flatMap(([key, item]) =>
    typeof item === "number"
      ? [[key, item] as const]
      : Object.entries(record(item))
          .filter(([, child]) => typeof child === "number")
          .map(
            ([childKey, child]) =>
              [`${key} ${childKey}`, child as number] as const,
          ),
  );
  if (!metrics.length)
    return (
      <p className="text-sm text-gray-500">No summary figures supplied yet.</p>
    );
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map(([key, item]) => (
        <div key={key} className={cardClass}>
          <p className="mb-2 text-sm text-gray-500">{label(key)}</p>
          <p className="text-3xl text-gray-900">{item.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
export function DataTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  const keys = Array.from(
    new Set(
      rows.flatMap((row) =>
        Object.keys(row).filter(
          (key) =>
            !/token|password|secret/i.test(key) &&
            row[key] !== null &&
            ["string", "number", "boolean"].includes(typeof row[key]),
        ),
      ),
    ),
  );
  if (!rows.length || !keys.length)
    return <p className="py-4 text-sm text-gray-500">No records available.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500">
            {keys.map((key) => (
              <th className="whitespace-nowrap p-3 font-medium" key={key}>
                {label(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={String(row.id || row.user_id || index)}
              className="border-b border-gray-100"
            >
              {keys.map((key) => (
                <td className="p-3 text-gray-700" key={key}>
                  {row[key] === undefined ||
                  row[key] === null ||
                  typeof row[key] === "object"
                    ? "—"
                    : typeof row[key] === "boolean"
                      ? row[key]
                        ? "Yes"
                        : "No"
                      : String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
