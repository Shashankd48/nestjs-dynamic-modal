"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@heroui/react";
import { APIServer } from "@/libs/apiServer";
import toast from "react-hot-toast";
import postgresDataTypes from "@/libs/constants/postgresDataTypes";

type Column = {
   name: string;
   type: string;
   isPrimaryKey: boolean;
   isUnique: boolean;
   isNotNull: boolean;
};

const SchemaForm = () => {
   const [tableName, setTableName] = useState("");
   const [columns, setColumns] = useState<Column[]>([
      {
         isNotNull: false,
         isPrimaryKey: true,
         isUnique: true,
         name: "id",
         type: "UUID",
      },
      {
         isNotNull: false,
         isPrimaryKey: true,
         isUnique: true,
         name: "creadedAt",
         type: "TIMESTAMP",
      },
      {
         isNotNull: false,
         isPrimaryKey: true,
         isUnique: true,
         name: "updatedAt",
         type: "TIMESTAMP",
      },
      {
         name: "",
         type: "VARCHAR",
         isPrimaryKey: false,
         isUnique: false,
         isNotNull: false,
      },
   ]);

   const handleColumnChange = <K extends keyof Column>(
      index: number,
      key: K,
      value: Column[K]
   ) => {
      const newColumns = [...columns];
      newColumns[index][key] =
         key === "name" ? (value.toString().trim() as Column[K]) : value;
      setColumns(newColumns);
   };

   const addColumn = () => {
      setColumns([
         ...columns,
         {
            name: "",
            type: "VARCHAR",
            isPrimaryKey: false,
            isUnique: false,
            isNotNull: false,
         },
      ]);
   };

   const handleSubmit = async () => {
      if (!tableName) return alert("Table name is required");

      const filterdColumns = columns.filter((item) => item.name.trim() !== "");

      console.log("log: columns", filterdColumns);

      try {
         await axios.post(`${APIServer}/schema`, {
            tableName,
            columns: filterdColumns,
         });
         toast.success("Schema created successfully");
      } catch (error) {
         console.error(error);
         toast.error("Failed to create schema");
      }
   };

   useEffect(() => {
      const test = async () => {
         try {
            await axios.get(`${APIServer}/schema`);
            // toast.success("Schema created successfully");
         } catch (error) {
            console.error(error);
            toast.error("Failed to create schema");
         }
      };

      test();
   }, []);

   return (
      <div className="border border-neutral-300 px-3 py-6 flex flex-col gap-y-3 rounded-lg w-fit">
         <h2 className="text-2xl font-semibold text-center mb-6">
            Create Table Schema
         </h2>
         <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Table Name"
            className="border border-neutral-300 rounded-md p-2 max-w-[315px]"
         />

         {columns.map((col, index) => (
            <div key={index} className="grid grid-cols-6 gap-3 items-center">
               <input
                  type="text"
                  value={col.name}
                  onChange={(e) =>
                     handleColumnChange(index, "name", e.target.value)
                  }
                  placeholder="Column Name"
                  className="border border-neutral-300 rounded-md p-2 col-span-2"
               />
               <select
                  value={col.type}
                  onChange={(e) =>
                     handleColumnChange(index, "type", e.target.value)
                  }
                  className="border border-neutral-300 rounded-md p-2"
               >
                  {postgresDataTypes.map((item) => (
                     <option value={item.value} key={item.value}>
                        {item.label}
                     </option>
                  ))}
               </select>

               <div>
                  <input
                     type="checkbox"
                     checked={col.isPrimaryKey}
                     onChange={(e) =>
                        handleColumnChange(
                           index,
                           "isPrimaryKey",
                           e.target.checked
                        )
                     }
                     aria-label="isPrimaryKey"
                  />{" "}
                  <label htmlFor="isPrimaryKey">Primary Key</label>
               </div>

               <div>
                  <input
                     type="checkbox"
                     checked={col.isUnique}
                     onChange={(e) =>
                        handleColumnChange(index, "isUnique", e.target.checked)
                     }
                     aria-label="isUnique"
                  />{" "}
                  <label htmlFor="isUnique">Unique</label>
               </div>

               <div>
                  <div>
                     <input
                        type="checkbox"
                        checked={col.isNotNull}
                        onChange={(e) =>
                           handleColumnChange(
                              index,
                              "isNotNull",
                              e.target.checked
                           )
                        }
                        aria-label="isNotNull"
                     />{" "}
                     <label htmlFor="isNotNull">Not Null</label>
                  </div>
               </div>
            </div>
         ))}

         <div className="flex gap-3 justify-end mt-6">
            <Button color="secondary" onPress={addColumn}>
               Add Column
            </Button>
            <Button onPress={handleSubmit} color="primary">
               Create Table
            </Button>
         </div>
      </div>
   );
};

export default SchemaForm;
