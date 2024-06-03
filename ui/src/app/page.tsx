import { ToastContainer } from "react-toastify";

import { getUsersTree } from "../api/users";
import Page from "../components/Page";

export default async function Home() {
  const result = await getUsersTree();
  return (
    <>
      <ToastContainer />
      <Page title={"Organization structure"} data={result.data} />
    </>
  );
}
