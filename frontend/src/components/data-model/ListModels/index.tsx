"use client";
import axiosInstance from "@/libs/axios-instance";
import { useSidebarStore } from "@/libs/store";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import toast from "react-hot-toast";

const ListModels = () => {
   const { dataModels, removeDataModels } = useSidebarStore();

   const removeModel = async (id: string) => {
      try {
         const res = await axiosInstance.delete(`/schema/${id}`);

         if (!res || !res.data) throw new Error("Failed to delete");

         removeDataModels(id);
         toast.success(res.data.message);
      } catch (error: any) {
         console.log(error);
         toast.error(error.message);
      }
   };

   return (
      <div className="flex flex-col gap-y-6">
         <h1 className="uppercase text-xl font-semibold">Data Models</h1>

         <div className="flex gap-6 flex-wrap">
            {dataModels.map((model) => (
               <div
                  key={model.id}
                  className="p-3 border border-neutral-300 rounded-lg min-w-[250px] flex justify-between"
               >
                  <p className="text-lg capitalize">{model.name}</p>
                  <div className="flex gap-3">
                     <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                     >
                        <Link href={`/${model.id}/model`}>
                           <Icon icon="cuida:edit-outline" fontSize={24} />
                        </Link>
                     </Button>
                     <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => removeModel(model.id)}
                     >
                        <Icon icon="mynaui:delete" fontSize={26} />
                     </Button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default ListModels;
