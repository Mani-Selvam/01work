import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  width?: string;
  type?: "text" | "number" | "date";
  editable?: boolean;
}

interface ExcelTableProps<T extends Record<string, any>> {
  columns: Column[];
  data: T[];
  onAdd: (newRow: Partial<T>) => void;
  onUpdate: (id: number, field: string, value: any) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function ExcelTable<T extends Record<string, any>>({
  columns,
  data,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
  emptyMessage = "No data yet. Click + Add Row to start.",
}: ExcelTableProps<T>) {
  const [editingCell, setEditingCell] = useState<{ rowId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const handleCellClick = (rowId: number, field: string, currentValue: any) => {
    const column = columns.find(col => col.key === field);
    if (column?.editable === false) return;
    
    setEditingCell({ rowId, field });
    setEditValue(currentValue?.toString() || "");
  };

  const handleCellBlur = () => {
    if (editingCell) {
      const column = columns.find(col => col.key === editingCell.field);
      let finalValue: any = editValue;
      
      if (column?.type === "number") {
        finalValue = editValue ? parseFloat(editValue) : null;
      }
      
      onUpdate(editingCell.rowId, editingCell.field, finalValue);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCellBlur();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleAddRow = () => {
    const newRow: any = {};
    columns.forEach(col => {
      if (col.key !== "id" && col.key !== "createdAt" && col.key !== "updatedAt") {
        newRow[col.key] = col.type === "number" ? 0 : "";
      }
    });
    onAdd(newRow as Partial<T>);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2">
        <Button
          onClick={handleAddRow}
          size="sm"
          data-testid="button-add-row"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="border-b border-border p-2 text-left text-sm font-medium sticky top-0 bg-muted z-10"
                    style={{ width: column.width || "auto", minWidth: "120px" }}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="border-b border-border p-2 w-16 sticky top-0 bg-muted z-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-8 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover-elevate">
                    {columns.map((column) => {
                      const isEditing =
                        editingCell?.rowId === row.id &&
                        editingCell?.field === column.key;
                      const cellValue = row[column.key];

                      return (
                        <td
                          key={`${row.id}-${column.key}`}
                          className={cn(
                            "border-b border-border p-0 cursor-pointer",
                            column.editable === false && "bg-muted/50 cursor-default"
                          )}
                          onClick={() => handleCellClick(row.id, column.key, cellValue)}
                          data-testid={`cell-${column.key}-${row.id}`}
                        >
                          {isEditing ? (
                            <Input
                              type={column.type === "number" ? "number" : column.type === "date" ? "date" : "text"}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className="border-0 h-full min-h-[40px] rounded-none focus-visible:ring-2 focus-visible:ring-ring"
                              data-testid={`input-${column.key}-${row.id}`}
                            />
                          ) : (
                            <div className="px-3 py-2 min-h-[40px] flex items-center text-sm">
                              {cellValue || (
                                <span className="text-muted-foreground italic">
                                  {column.editable === false ? "-" : "Click to edit"}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="border-b border-border p-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(row.id)}
                        data-testid={`button-delete-${row.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
