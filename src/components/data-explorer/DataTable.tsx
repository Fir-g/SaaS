import { Database } from "lucide-react";
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface DataTableProps {
  data: any[][];
  tableName: string;
  dimensions: { rows: number; columns: number };
}

export const DataTable = ({ data }: DataTableProps) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Database className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
      <div className="max-h-[70vh] w-full overflow-x-auto overflow-y-auto shadow-inner" style={{ maxWidth: "100%" }}>
        <Table className="table-auto border-collapse">
          <TableHeader className="sticky top-0 bg-gray-50 z-10 overflow-visible">
            <TableRow>
              {data[0]?.map((header: any, colIndex: number) => (
                <TableHead key={colIndex} className="px-3 py-2 text-xs uppercase tracking-wider text-gray-600 whitespace-nowrap min-w-[10rem] border-r border-gray-200 last:border-r-0">
                  {header || `Column ${colIndex + 1}`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(1).map((row: any[], rowIndex: number) => (
              <TableRow key={rowIndex}>
                {row.map((cell: any, colIndex: number) => (
                  <TableCell key={colIndex} className="px-3 py-2 text-sm text-gray-900 align-top min-w-[10rem] border-r border-gray-100 last:border-r-0">
                    <div className="break-words whitespace-normal" title={cell !== null && cell !== undefined ? String(cell) : ''}>
                      {cell !== null && cell !== undefined ? String(cell) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
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