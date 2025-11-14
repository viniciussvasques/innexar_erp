'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Download } from 'lucide-react';

interface Column<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  showSearch?: boolean;
  showExport?: boolean;
  onExport?: () => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  emptyMessage = 'No data available',
  showSearch = true,
  showExport = false,
  onExport,
}: Readonly<DataTableProps<T>>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey] as string | number;
      const bVal = b[sortKey] as string | number;

      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder]);

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return sortedData;

    return sortedData.filter((row) => {
      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [sortedData, searchTerm]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent border-brand-500" />
            <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-card">
      {/* Table Header Actions */}
      {(showSearch || showExport) && (
        <div className="flex items-center justify-between border-b border-border p-4">
          {showSearch && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none ring-brand-500 transition-shadow placeholder:text-muted-foreground focus:ring-2"
              />
            </div>
          )}
          {showExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    'px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/80'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <span className="text-muted-foreground/50">
                        {sortKey === column.key && sortOrder === 'asc' && (
                          <ChevronUp className="h-4 w-4" />
                        )}
                        {sortKey === column.key && sortOrder === 'desc' && (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {sortKey !== column.key && (
                          <ChevronsUpDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => {
                // Safe key generation with proper type checking
                const generateRowKey = (id: unknown, index: number): string => {
                  switch (typeof id) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                      return `row-${id}`;
                    default:
                      return `row-${index}`; // null, undefined, object, function, symbol
                  }
                };
                
                const rowId = generateRowKey(row.id, rowIndex);
                return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-border transition-colors',
                    'hover:bg-muted/30',
                    onRowClick && 'cursor-pointer',
                    rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-foreground"
                    >
                      {column.render
                        ? column.render(row[column.key] as T[keyof T], row)
                        : (() => {
                            const value = row[column.key];
                            if (value === null || value === undefined) return '-';
                            if (typeof value === 'object') return JSON.stringify(value);
                            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                              return `${value}`;
                            }
                            return '-';
                          })()}
                    </td>
                  ))}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} results
          </p>
        </div>
      )}
    </div>
  );
}
