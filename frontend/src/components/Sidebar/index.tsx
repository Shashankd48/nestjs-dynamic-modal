"use client";

import Link from "next/link";
import { useState } from "react";

const Sidebar = () => {
   const [dataModals, setDataModals] = useState("Hello");

   return (
      <div className="h-[90vh] border-r border-neutral-300 p-3 col-span-2">
         Sidebar {dataModals}
         <p onClick={() => setDataModals("New")}>Set</p>
         <Link href="/users/view">Users</Link>
         <br />
         <Link href="/companies/view">Companies</Link>
         <br />
         <Link href="/todos/view">Todos</Link>
      </div>
   );
};

export default Sidebar;
