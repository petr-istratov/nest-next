import { ToastContainer } from "react-toastify";
import Page from '../components/Page';
import { TreeItem } from "@/components/FolderSortableTree/FolderSortableTree";

// move to separate folder

async function getData() {
  const result = await fetch('http://localhost:8000/users', {
    method: 'GET',
    next: { revalidate: 0 },
  });
  if (!result.ok) {
    throw new Error('Failed to fetch data')
  };
 
  return result.json();
}

export default async function Home() {
  const data = await getData();
  return (
    <>
      <ToastContainer />
      <Page title={'Organization structure'} data={data} />
    </>
  );
}
