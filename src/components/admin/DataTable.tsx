import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2, Eye } from "lucide-react";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  editRoute?: (id: string | number) => string;
  viewRoute?: (id: string | number) => string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  emptyMessage = "No records found.",
  onEdit,
  onDelete,
  editRoute,
  viewRoute
}: DataTableProps<T>) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f1f3f6] border-b border-slate-200">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={`py-4 px-6 text-left text-[11px] font-black text-slate-500 uppercase tracking-widest ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete || editRoute || viewRoute) && (
                <th className="py-4 px-6 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest w-40">Actions</th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-20 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#2874f0]/20 border-t-[#2874f0] rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving Records...</p>
                   </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-24 text-center">
                  <p className="text-sm font-bold text-slate-400">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-slate-50/50 transition-colors group">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`py-4 px-6 text-sm font-semibold text-slate-700 ${col.className || ""}`}>
                      {typeof col.accessorKey === "function" ? col.accessorKey(row) : (row[col.accessorKey] as ReactNode)}
                    </td>
                  ))}

                  {(onEdit || onDelete || editRoute || viewRoute) && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {viewRoute && (
                          <Link
                            to={viewRoute(row.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        {editRoute && (
                          <Link
                            to={editRoute(row.id)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Update Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
