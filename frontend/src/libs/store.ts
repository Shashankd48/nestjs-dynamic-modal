import { create } from "zustand";

type Store = {
   dataModels: any[];
   setDataModels: (data: any[]) => void;
   removeDataModels: (id: string) => void;
   addDataModels: (data: any) => void;
};

export const useSidebarStore = create<Store>()((set) => ({
   dataModels: [],

   setDataModels: (data: any[]) =>
      set((state) => ({ ...state, dataModels: [...data] })),

   addDataModels: (data: any) =>
      set((state) => ({ ...state, dataModels: [...state.dataModels, data] })),

   removeDataModels: (id: string) =>
      set((state) => ({
         ...state,
         dataModels: state.dataModels.filter((item) => item.id !== id),
      })),
}));
