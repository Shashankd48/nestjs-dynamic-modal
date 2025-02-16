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

      if (!res || !res.data) throw new Error("No data found");

      initialData = res.data;
   } catch (error) {
      console.error(error);
   }

   return <DataTable {...{ initialData, id }} />;
};

export default ViewModelPage;
