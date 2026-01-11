import { HTMLAttributes } from 'react';
import './Table.css';

// Table Root
export interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export function Table({ className = '', children, ...props }: TableProps) {
  return (
    <div className="table-container">
      <table className={`table ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

// Table Header
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({ className = '', children, ...props }: TableHeaderProps) {
  return (
    <thead className={`table-header ${className}`} {...props}>
      {children}
    </thead>
  );
}

// Table Body
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ className = '', children, ...props }: TableBodyProps) {
  return (
    <tbody className={`table-body ${className}`} {...props}>
      {children}
    </tbody>
  );
}

// Table Row
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
}

export function TableRow({ clickable = false, className = '', children, ...props }: TableRowProps) {
  return (
    <tr className={`table-row ${clickable ? 'table-row-clickable' : ''} ${className}`} {...props}>
      {children}
    </tr>
  );
}

// Table Head Cell
export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export function TableHead({
  sortable = false,
  sortDirection = null,
  onSort,
  className = '',
  children,
  ...props
}: TableHeadProps) {
  return (
    <th
      className={`table-head ${sortable ? 'table-head-sortable' : ''} ${className}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="table-head-content">
        {children}
        {sortable && (
          <span className="table-sort-icon">
            {sortDirection === 'asc' && (
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {sortDirection === 'desc' && (
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {sortDirection === null && (
              <svg viewBox="0 0 20 20" fill="currentColor" className="sort-icon-inactive">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 110 4H4a2 2 0 01-2-2z" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
}

// Table Cell
export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export function TableCell({ className = '', children, ...props }: TableCellProps) {
  return (
    <td className={`table-cell ${className}`} {...props}>
      {children}
    </td>
  );
}
