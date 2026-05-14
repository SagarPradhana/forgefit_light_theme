import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { LoaderSpinner, EmptyState } from "./LoadingStates";
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  
  // Features
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  selectable?: boolean;
  actions?: boolean;
  
  // Callbacks
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onSelect?: (selected: T[]) => void;
  
  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string; // legacy alias
  emptyAction?: React.ReactNode;
  
  // Pagination
  pageSize?: number;
  total?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  className?: string;
}

export function Table<T extends { id?: string | number }>({
  data,
  columns,
  loading,
  error,
  onRetry,
  searchable = false,
  sortable = true,
  pagination = true,
  selectable = false,
  actions = false,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onSelect,
  emptyTitle = "No data found",
  emptyDescription,
  emptyMessage,
  emptyAction,
  pageSize = 10,
  total,
  currentPage = 1,
  onPageChange,
  className,
}: TableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [currentPageState, setCurrentPageState] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | number | null>(null);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...(data || [])];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          if (col.searchable === false) return false;
          const value = row[col.key as keyof T];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, search, sortKey, sortOrder, columns]);

  // Pagination
  const totalItems = total || processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = pagination 
    ? processedData.slice((currentPageState - 1) * pageSize, currentPageState * pageSize)
    : processedData;

  const handleSort = (key: string) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelect?.([]);
    } else {
      const allIds = new Set(paginatedData.map((row) => row.id).filter(Boolean));
      setSelectedRows(allIds);
      onSelect?.(paginatedData);
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onSelect?.(paginatedData.filter((row) => newSelected.has(row.id)));
  };

  // Loading state
  if (loading) {
    return (
      <div className={clsx("overflow-x-auto rounded-2xl border border-[var(--border-subtle)]", className)}>
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
              {selectable && <th className="w-12 px-4 py-4"><div className="w-5 h-5 rounded bg-[var(--border-subtle)] animate-pulse" /></th>}
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={clsx("px-4 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider", col.className)}
                  style={{ width: col.width }}
                >
                  <div className="h-4 w-20 rounded bg-[var(--border-subtle)] animate-pulse" />
                </th>
              ))}
              {actions && <th className="w-12 px-4 py-4" />}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]">
                {selectable && <td className="px-4 py-4"><div className="w-5 h-5 rounded bg-[var(--border-subtle)] animate-pulse" /></td>}
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-4 rounded bg-[var(--border-subtle)] animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
                {actions && <td className="px-4 py-4"><div className="w-8 h-8 rounded bg-[var(--border-subtle)] animate-pulse" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] font-medium mb-4">Failed to load data</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-[var(--accent-orange)] text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (!paginatedData.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription || emptyMessage}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={className}>
      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-orange)] focus:ring-2 focus:ring-[var(--glow-orange)] transition-all"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-card)] border-b border-[var(--border-subtle)]">
              {selectable && (
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent-orange)] focus:ring-[var(--accent-orange)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th 
                  key={col.key}
                  className={clsx(
                    "px-4 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider",
                    col.sortable !== false && sortable && "cursor-pointer hover:text-[var(--text-primary)] transition-colors",
                    col.className
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortable && col.sortable !== false && (
                      sortKey === col.key 
                        ? (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                        : <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="w-12 px-4 py-4" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {paginatedData.map((row, index) => (
              <motion.tr
                key={row.id ?? index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className={clsx(
                  "hover:bg-[var(--bg-card-hover)] transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => handleSelectRow(row.id!)}
                      className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent-orange)] focus:ring-[var(--accent-orange)]"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className={clsx("px-4 py-4 text-sm text-[var(--text-secondary)]", col.className)}
                  >
                    {col.render ? col.render(row, index) : String(row[col.key as keyof T] ?? "-")}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-4 relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === row.id ? null : row.id)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    
                    <AnimatePresence>
                      {actionMenuOpen === row.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-4 top-12 z-20 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-[var(--shadow-hover)] py-2 min-w-[140px]"
                        >
                          {onView && (
                            <button
                              onClick={() => { onView(row); setActionMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => { onEdit(row); setActionMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent-orange)] transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => { onDelete(row); setActionMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {((currentPageState - 1) * pageSize) + 1} to {Math.min(currentPageState * pageSize, totalItems)} of {totalItems} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPageState((p) => Math.max(1, p - 1))}
              disabled={currentPageState === 1}
              className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPageState(page)}
                  className={clsx(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    currentPageState === page
                      ? "bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-gold)] text-white"
                      : "text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]"
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPageState((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageState === totalPages}
              className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}