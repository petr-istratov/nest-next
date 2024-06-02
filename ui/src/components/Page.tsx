'use client'

import Head from 'next/head';
import { Box, Heading, Main } from 'grommet';

import FolderSortableTree, {
  Event,
  TreeItems,
  TreeItem,
} from '../components/FolderSortableTree/FolderSortableTree';
import toastAction, { NOTIFICATIONS_TYPES } from '../utils/toastActions';

const addUser = async (payload: TreeItem) => {
  const result = await fetch('http://localhost:8000/users', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (result.ok !== true) {
    throw new Error('Failed to create user');
  }
 
  return { status: result.status, data: result.json() };
}

const deleteUser = async (id: string) => {
  const result = await fetch(`http://localhost:8000/users/${id}`, {
    method: 'DELETE',
  })
  if (result.ok !== true) {
    throw new Error('Failed to delete user');
  }
 
  return { status: result.status };
}

const updateUser = async (payload: { id: string; parentId: string; position: number }) => {
  const result = await fetch(`http://localhost:8000/users/${payload.id}`, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (result.ok !== true) {
    throw new Error('Failed to update user');
  }
 
  return { status: result.status };
}

interface PageProps {
  data: TreeItems;
  title: string;
}

export default function Page(props: PageProps) {
  const onTreeStateChange = async (state: TreeItems, event: Event) => {
    switch (event.type) {
      case `ADD_NODE`: {
        toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.DEFAULT });
        const res = await addUser({
          id: event.payload.id,
          firstName: event.payload.firstName,
          lastName: event.payload.lastName,
          parentId: event.payload.parentId || null,
          position: event.payload.position,
        });
        if (res.status === 201) {
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.SUCCESS });
        } else {
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.ERROR });
        }
        break;
      }
      case `DELETE_NODE`: {
        toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.DEFAULT });
        const res = await deleteUser(event.payload.id);
        if (res.status === 200) {
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.SUCCESS });
        } else {
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.ERROR });
        }
        break;
      }
      case `SORT`: {
        toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.DEFAULT });
        const res = await updateUser({
          id: event.payload.id,
          parentId: event.payload.newParentId || null,
          position: event.payload.newPosition,
        });
        if (res.status === 200) {
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.SUCCESS });
        } else {
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.ERROR });
        }
        break;
      }
    }
  }

  return (
    <>
      <Head>
        <title>{props.title} | NEST_NEXT</title>
        <meta name="description" content="Content" />
      </Head>
      <Main overflow="unset" pad="large" gap="medium">
        <Box direction="row" align="center" gap="small" justify="between">
          <Box direction="row" align="center" gap="small">
            <Heading size="medium" margin="none" style={{ overflowWrap: `anywhere` }}>
              {props.title}
            </Heading>
          </Box>
        </Box>
        <FolderSortableTree
          data={props.data}
          onChange={(state, event) => void onTreeStateChange(state, event)}
        />
      </Main>
    </>
  );
}