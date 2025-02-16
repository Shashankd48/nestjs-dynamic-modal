"use client";

import { Button } from "@heroui/react";
import NextUITable from "./NextUITable";
import { useState } from "react";
import { NextUIModal } from "../next-ui";
import CreateModelDataForm from "../data-model/CreateModelDataForm";
import { Icon } from "@iconify/react/dist/iconify.js";
import axiosInstance from "@/libs/axios-instance";
import toast from "react-hot-toast";
import { AxiosResponse } from "axios";

type Props = { id: string; initialData: { data: any[]; columns: any[] } };

const DataTable = ({ id, initialData }: Props) => {
   const [isOpen, setIsOpen] = useState(false);
   const [data, setData] = useState<typeof initialData>(initialData);
   const [editData, setEditData] = useState<any | null>(null);

   const handleClose = () => {
      setIsOpen(false);
      setEditData(null);
   };

   const handleOpen = () => setIsOpen(true);

   const handleSubmit = async (values: any, cb: Function) => {
      try {
         let res: AxiosResponse<any, any>;
         if (editData) {
            res = await axiosInstance.put(
               `/schema/data/${id}/${editData.id}`,
               values
            );
         } else {
            res = await axiosInstance.post(`/schema/data/${id}`, values);
         }

         if (!res || !res.data) throw new Error("Failed to save record");

         toast.success("Record saved!");

         setData((prevState) => ({
            ...prevState,
            data: editData
               ? prevState.data.map((item) =>
                    item.id === editData.id ? res.data : item
                 ) // Replace updated item
               : [res.data, ...prevState.data], // Add new item
         }));

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

   const handleEdit = (values: any) => {
      console.log("log: values", values);
      setEditData(values);
      handleOpen();
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
            moreOptions={{ onDelete: handleDelete, onEdit: handleEdit }}
         />

         <NextUIModal
            title={editData ? `Update ${id}` : `Add ${id}`}
            open={isOpen}
            onClose={handleClose}
            size="lg"
         >
            <CreateModelDataForm
               columns={data.columns}
               onSubmit={handleSubmit}
               onCancel={handleClose}
               values={editData}
            />
         </NextUIModal>
      </div>
   );
};

export default DataTable;
