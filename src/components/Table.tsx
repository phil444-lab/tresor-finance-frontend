import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

export function Table({ children }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-muted/50">
      {children}
    </thead>
  );
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, onClick }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-border transition-colors ${
        onClick ? 'cursor-pointer hover:bg-muted/30' : ''
      }`}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th className={`px-4 py-3 text-left ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', colSpan }: TableCellProps) {
  return (
    <td className={`px-4 py-3 ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
