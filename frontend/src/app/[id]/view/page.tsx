import DataTable from "@/components/DataTable";
import { APIServer } from "@/libs/apiServer";
import axios from "axios";

type Props = {
   params: { id: string };
};
const ViewModelPage = async ({ params }: Props) => {
   const { id } = await params;

   let initialData: { data: any[]; columns: any[] } = { data: [], columns: [] };

   try {
      const res = await axios.get(`${APIServer}/schema/data/${id}?limit=10`);

      console.log(res.data);
      if (!res || !res.data) throw new Error("No data found");

      initialData = res.data;
   } catch (error) {
      console.error(error);
   }

   return (
      <div className="flex flex-col gap-y-6">
         <h1 className="uppercase text-xl font-semibold">{id}</h1>

         <DataTable {...{ initialData, id }} />
      </div>
   );
};

export default ViewModelPage;
