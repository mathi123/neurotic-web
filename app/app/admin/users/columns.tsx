'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/app/components/ui/badge';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { User } from '@/domain/user.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
}

export const createColumns = (options?: ColumnOptions): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" onSort={options?.onSort} />,
    enableHiding: true,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" onSort={options?.onSort} />,
    enableHiding: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" onSort={options?.onSort} />,
    cell: ({ row }) => {
      const role = row.getValue('role') as string | null;
      if (!role) return <span className="text-muted-foreground">—</span>;
      return <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{role}</Badge>;
    },
    enableHiding: true,
    enableSorting: false,
  },
  {
    accessorKey: 'emailVerified',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Verified" onSort={options?.onSort} />,
    cell: ({ row }) => {
      const verified = row.getValue('emailVerified') as boolean;
      return <Badge variant={verified ? 'default' : 'outline'}>{verified ? 'Yes' : 'No'}</Badge>;
    },
    enableHiding: true,
    enableSorting: false,
  },
  {
    accessorKey: 'banned',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" onSort={options?.onSort} />,
    cell: ({ row }) => {
      const banned = row.getValue('banned') as boolean | null;
      return <Badge variant={banned ? 'destructive' : 'default'}>{banned ? 'Banned' : 'Active'}</Badge>;
    },
    enableHiding: true,
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" onSort={options?.onSort} />,
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date | string;
      return new Date(date).toLocaleDateString();
    },
    enableHiding: true,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" onSort={options?.onSort} />,
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date | string;
      return new Date(date).toLocaleDateString();
    },
    enableHiding: true,
  },
];
