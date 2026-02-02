'use client';

import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  onSort?: (columnId: string, desc: boolean) => void;
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className, onSort }: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  const handleClick = () => {
    // Toggle: unsorted -> asc -> desc -> asc -> desc ...
    const nextDesc = isSorted === 'asc';
    column.toggleSorting(nextDesc);
    onSort?.(column.id, nextDesc);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={handleClick}>
        <span>{title}</span>
        {isSorted === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : isSorted === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
