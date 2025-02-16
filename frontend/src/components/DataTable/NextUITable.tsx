import {
   Table,
   TableHeader,
   TableColumn,
   TableBody,
   TableRow,
   TableCell,
   Dropdown,
   DropdownTrigger,
   Button,
   DropdownMenu,
   DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import moment from "moment";
import { useCallback, useMemo } from "react";

type Props = {
   initialData: { data: any[]; columns: any[] };
   id: string;
   moreOptions: {
      onDelete: (rowId: string) => Promise<void>;
      onEdit: (values: any) => void;
   };
};

export default function NextUITable({
   initialData: { data, columns: metadata },
   id,
   moreOptions: { onDelete, onEdit },
}: Props) {
   // Preserve case-sensitive column keys
   const columns = useMemo(() => {
      const tempColumns = metadata.map((item) => ({
         key: item.name, // Keep original case
         label: item.name,
         type: item.type, // Store type for better rendering
      }));
      tempColumns.push({ key: "actions", label: "", type: "actions" });
      return tempColumns;
   }, [metadata]);

   // Dynamically render table cell content
   const renderCell = useCallback(
      (item: any, columnKey: string) => {
         const columnMeta = metadata.find((col) => col.name === columnKey);
         if (!columnMeta) return item[columnKey] || "-"; // Default value

         const cellValue = item[columnKey];

         // Handle different data types
         if (!cellValue) return "-"; // Fallback for null/undefined

         switch (columnMeta.type.toUpperCase()) {
            case "UUID":
               return cellValue.split("-")[0];

            case "TIMESTAMP":
            case "DATE":
               return moment(cellValue).format("DD/MM/YY");

            default:
               return cellValue;
         }
      },
      [metadata]
   );

   return (
      <Table aria-label="Example table with dynamic content">
         <TableHeader columns={columns}>
            {(column) => (
               <TableColumn key={column.key} className="capitalize">
                  {column.label}
               </TableColumn>
            )}
         </TableHeader>
         <TableBody items={data} emptyContent={`No ${id} found`}>
            {(item) => (
               <TableRow key={item.id}>
                  {columns.map((column) => (
                     <TableCell key={column.key}>
                        {column.key === "actions" ? (
                           <div className="relative flex justify-end items-center gap-2">
                              <Dropdown className="bg-background border-1 border-default-200">
                                 <DropdownTrigger>
                                    <Button
                                       isIconOnly
                                       radius="full"
                                       size="sm"
                                       variant="light"
                                    >
                                       <Icon icon="mage:dots" fontSize={24} />
                                    </Button>
                                 </DropdownTrigger>
                                 <DropdownMenu>
                                    <DropdownItem key="view">View</DropdownItem>
                                    <DropdownItem
                                       key="edit"
                                       color="primary"
                                       onPress={() => onEdit(item)}
                                    >
                                       Edit
                                    </DropdownItem>
                                    <DropdownItem
                                       key="delete"
                                       color="danger"
                                       onPress={() => onDelete(item.id)}
                                    >
                                       Delete
                                    </DropdownItem>
                                 </DropdownMenu>
                              </Dropdown>
                           </div>
                        ) : (
                           renderCell(item, column.key)
                        )}
                     </TableCell>
                  ))}
               </TableRow>
            )}
         </TableBody>
      </Table>
   );
}
