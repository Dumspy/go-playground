import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface TableLoadingProps {
  title: string;
  columnCount?: number;
  rowCount?: number;
  hasActions?: boolean;
  showHeader?: boolean;
}

const TableLoading: React.FC<TableLoadingProps> = ({
  title,
  columnCount = 5,
  rowCount = 5,
  hasActions = true,
  showHeader = true
}) => {
  // Adjust column count if there's an actions column
  const actualColumnCount = hasActions ? columnCount + 1 : columnCount;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button>
          Loading..
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow>
                {Array(columnCount)
                  .fill(null)
                  .map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-6 w-full max-w-[120px]" />
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {Array(rowCount)
              .fill(null)
              .map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array(actualColumnCount)
                    .fill(null)
                    .map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        {hasActions && colIndex === columnCount ? (
                          <div className="flex justify-end">
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        ) : (
                          <Skeleton className="h-5 w-full" />
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableLoading;
