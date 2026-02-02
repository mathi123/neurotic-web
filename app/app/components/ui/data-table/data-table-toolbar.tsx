'use client';

import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterSlot?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterSlot,
}: DataTableToolbarProps<TData>) {
  const isFiltered = searchValue.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input placeholder={searchPlaceholder} value={searchValue} onChange={(e) => onSearchChange(e.target.value)} className="pr-9 pl-9" />
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                onClick={() => onSearchChange('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      {filterSlot && <div className="flex items-center gap-2">{filterSlot}</div>}
    </div>
  );
}
