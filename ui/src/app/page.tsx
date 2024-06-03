import { ToastContainer } from "react-toastify";
import Page from '../components/Page';
import { getUsersTree } from '../api/users';

export default async function Home() {
  const result = await getUsersTree();
  return (
    <>
      <ToastContainer />
      <Page title={'Organization structure'} data={result.data} />
    </>
  );
}
