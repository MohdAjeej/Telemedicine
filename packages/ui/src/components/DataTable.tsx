import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Skeleton,
} from '@mui/material';
import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}: DataTableProps<T>) {
  const showPagination =
    page !== undefined &&
    rowsPerPage !== undefined &&
    totalCount !== undefined &&
    onPageChange &&
    onRowsPerPageChange;

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align} width={column.width}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!loading &&
              rows.map((row) => (
                <TableRow key={getRowId(row)} hover>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && rows.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
      {showPagination && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_event, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Paper>
  );
}
