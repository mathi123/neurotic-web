'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Ban, Shield, UserCheck, UserIcon } from 'lucide-react';

import { User } from '@/domain/user.model';
import { Page } from '@/domain/page.model';
import { Role } from '@/domain/role.model';
import { ALL_USER_ROLES, ALL_USER_STATUSES, UserStatus } from '@/domain/user.filter';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DataTable, DataTableFacetedFilter, DataTablePagination, DataTableToolbar, FacetedFilterOption } from '@/app/components/ui/data-table';
import { createColumns } from './columns';

const STATUS_OPTIONS: FacetedFilterOption[] = ALL_USER_STATUSES.map((status) => ({
  value: status,
  label: status === UserStatus.ACTIVE ? 'Active' : 'Banned',
  icon: status === UserStatus.ACTIVE ? UserCheck : Ban,
}));

const ROLE_OPTIONS: FacetedFilterOption[] = ALL_USER_ROLES.map((role) => ({
  value: role,
  label: role === Role.ADMIN ? 'Admin' : 'User',
  icon: role === Role.ADMIN ? Shield : UserIcon,
}));

const DEFAULT_PAGE_SIZE = 10;

interface UsersState {
  data: User[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

// Map column IDs to backend sort columns
const SORT_COLUMN_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function UsersPage() {
  const [state, setState] = useState<UsersState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    updatedAt: false, // Hide by default
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPageIndex(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset to first page when filters change
  const handleStatusChange = (values: string[]) => {
    setStatuses(values);
    setPageIndex(0);
  };

  const handleRoleChange = (values: string[]) => {
    setRoles(values);
    setPageIndex(0);
  };

  // Handle server-side sort
  const handleSort = useCallback((columnId: string, desc: boolean) => {
    setSorting([{ id: columnId, desc }]);
    setPageIndex(0); // Reset to first page on sort change
  }, []);

  // Create columns with sort handler
  const columns = useMemo(() => createColumns({ onSort: handleSort }), [handleSort]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (statuses.length > 0) params.set('statuses', statuses.join(','));
      if (roles.length > 0) params.set('roles', roles.join(','));
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      // Add sorting params
      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/users?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error('Failed to fetch users');
      }

      const result: Page<User> = await response.json();
      setState({
        data: result.records,
        total: result.total,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [debouncedQuery, statuses, roles, pageIndex, pageSize, sorting]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const pageCount = Math.ceil(state.total / pageSize);

  const table = useReactTable({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: {
      sorting,
      columnVisibility,
    },
  });

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchUsers} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <>
      <DataTableFacetedFilter title="Status" options={STATUS_OPTIONS} selectedValues={statuses} onSelectedChange={handleStatusChange} />
      <DataTableFacetedFilter title="Role" options={ROLE_OPTIONS} selectedValues={roles} onSelectedChange={handleRoleChange} />
    </>
  );

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        title="Users"
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search users..."
        filterSlot={filterSlot}
      />

      {state.isLoading ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border">
            <div className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <DataTable table={table} columns={columns} />
          <DataTablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageCount={pageCount}
            totalItems={state.total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}
