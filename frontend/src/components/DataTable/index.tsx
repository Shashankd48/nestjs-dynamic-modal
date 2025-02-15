"use client";

import NextUITable from "./NextUITable";

type Props = { id: string; initialData: { data: any[]; columns: any[] } };

const DataTable = ({ id, initialData }: Props) => {
   return (
      <div>
         <NextUITable initialData={initialData} id={id} />
      </div>
   );
};

export default DataTable;
