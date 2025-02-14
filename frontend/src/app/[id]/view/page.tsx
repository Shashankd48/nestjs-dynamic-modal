import { APIServer } from "@/libs/apiServer";
import axios from "axios";
import moment from "moment";

type Props = {
   params: { id: string };
};
const CreateObjectPage = async ({ params }: Props) => {
   const { id } = await params;

   const res = await axios.get(`${APIServer}/schema/data/${id}?limit=20`);

   console.log(res.data);

   return (
      <div className="flex flex-col gap-y-6">
         <h1 className="uppercase text-xl font-semibold">{id}</h1>

         <div className="flex flex-col gap-3">
            {res?.data.length > 0 &&
               res.data.map((item: any, index: number) => (
                  <div key={item.id} className="flex gap-3">
                     <p>{index + 1}.</p>
                     <p>{item.id.split("-")[0]}</p>
                     <p>{item.name}</p>
                     <p>{moment(item.createdat).format("D/MM/YYYY")}</p>
                     <p>{moment(item.updatedat).format("D/MM/YYYY")}</p>
                  </div>
               ))}
         </div>
      </div>
   );
};

export default CreateObjectPage;
