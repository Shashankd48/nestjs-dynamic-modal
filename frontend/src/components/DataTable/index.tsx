"use client";

import { Button } from "@heroui/react";
import NextUITable from "./NextUITable";
import { useState } from "react";
import { NextUIModal } from "../next-ui";
import CreateModelDataForm from "../data-model/CreateModelDataForm";
import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "@/libs/axios-instance";
import toast from "react-hot-toast";

type Props = { id: string; initialData: { data: any[]; columns: any[] } };

const DataTable = ({ id, initialData }: Props) => {
   const [isOpen, setIsOpen] = useState(false);
   const [data, setData] = useState<typeof initialData>(initialData);

   const handleClose = () => setIsOpen(false);

   const handleSubmit = async (values: any, cb: Function) => {
      try {
         const res = await axiosInstance.post(`/schema/data/${id}`, values);

         if (!res || !res.data) throw new Error("Failed to save record");

         toast.success("Record saved!");

         if (res.data) {
            setData((prevState) => ({
               ...prevState,
               data: [res.data, ...prevState.data],
            }));
         }
         cb();
         handleClose();
      } catch (error: any) {
         toast.error(error.message);
      }
   };

   const handleDelete = async (rowId: string) => {
      try {
         const res = await axiosInstance.delete(`/schema/data/${id}/${rowId}`);

         if (!res || !res.data) throw new Error("Failed to delete record");

         toast.success("Record deleted!");

         if (res.data) {
            setData((prevState) => ({
               ...prevState,
               data: prevState.data.filter((item) => item.id !== rowId),
            }));
         }
      } catch (error: any) {
         toast.error(error.message);
      }
   };

   return (
      <div className="flex flex-col gap-y-6">
         <div className="flex justify-between">
            <h1 className="uppercase text-xl font-semibold">{id}</h1>
            <Button
               onPress={() => setIsOpen(true)}
               startContent={
                  <Icon icon="gridicons:add-outline" fontSize={18} />
               }
               variant="bordered"
            >
               New record
            </Button>
         </div>

         <NextUITable
            initialData={data}
            id={id}
            moreOptions={{ onDelete: handleDelete }}
         />

         <NextUIModal
            title={`Add ${id}`}
            open={isOpen}
            onClose={handleClose}
            size="lg"
         >
            <CreateModelDataForm
               columns={data.columns}
               onSubmit={handleSubmit}
               onCancel={handleClose}
            />
         </NextUIModal>
      </div>
   );
};

export default DataTable;
