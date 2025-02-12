"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { APIServer } from "@/libs/apiServer";
import { Divider } from "@heroui/react";

const Sidebar = () => {
   const [dataModals, setDataModals] = useState<any[]>([]);

   useEffect(() => {
      getSchemas();
   }, []);

   const getSchemas = async () => {
      try {
         const res = await axios.get(`${APIServer}/schema`);

         if (!res) throw new Error("No schema found");
         setDataModals(res.data);
      } catch (error) {
         setDataModals([]);
      }
   };

   return (
      <div className="h-[90vh] border-r border-neutral-300 p-3 col-span-2 flex flex-col gap-y-3">
         <h2 className="font-bold text-lg">Data Models</h2>

         <Divider />

         <div className="flex flex-col gap-y-3">
            {dataModals.map((item) => (
               <Link
                  href={`/${item.name}/view`}
                  className="capitalize border-b border-neutral-300 hover:text-blue-700 hover:border-blue-700"
                  key={item.name}
               >
                  {item.name}
               </Link>
            ))}
         </div>
      </div>
   );
};

export default Sidebar;
