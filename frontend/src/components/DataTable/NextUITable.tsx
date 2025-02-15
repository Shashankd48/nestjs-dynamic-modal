import {
   Table,
   TableHeader,
   TableColumn,
   TableBody,
   TableRow,
   TableCell,
} from "@heroui/react";
import moment from "moment";
import { useCallback, useMemo } from "react";

type Props = {
   initialData: { data: any[]; columns: any[] };
   id: string;
};

export default function NextUITable({
   initialData: { data, columns: metadata },
   id,
}: Props) {
   const columns = useMemo(() => {
      return metadata.map((item) => {
         return { key: item.name.toLowerCase(), label: item.name };
      });
   }, [metadata]);

   const renderCell = useCallback(
      (item: any, columnKey: any) => {
         const cellValue = item[columnKey];

         switch (columnKey) {
            case "id":
               return cellValue.split("-")[0];

            case "createdat":
            case "updatedat":
               return moment(cellValue).fromNow();

            // case "actions":
            //    return (
            //       <div className="relative flex justify-end items-center gap-2">
            //          <Dropdown className="bg-background border-1 border-default-200">
            //             <DropdownTrigger>
            //                <Button
            //                   isIconOnly
            //                   radius="full"
            //                   size="sm"
            //                   variant="light"
            //                >
            //                   <VerticalDotsIcon className="text-default-400" />
            //                </Button>
            //             </DropdownTrigger>
            //             <DropdownMenu>
            //                <DropdownItem key="view">View</DropdownItem>
            //                <DropdownItem key="edit">Edit</DropdownItem>
            //                <DropdownItem key="delete">Delete</DropdownItem>
            //             </DropdownMenu>
            //          </Dropdown>
            //       </div>
            //    );
            default:
               return cellValue;
         }
      },
      [data]
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
                  {(columnKey) => (
                     <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
               </TableRow>
            )}
         </TableBody>
      </Table>
   );
}
