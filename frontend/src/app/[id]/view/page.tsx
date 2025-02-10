type Props = {
   params: { id: string };
};
const CreateObjectPage = async ({ params: { id } }: Props) => {
   return <div>View {id}</div>;
};

export default CreateObjectPage;
