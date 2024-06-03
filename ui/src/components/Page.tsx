"use client";

import { Box, Heading, Main } from "grommet";
import Head from "next/head";

import { addUser, deleteUser, updateUser } from "../api/users";
import FolderSortableTree, {
  Event,
  TreeItems,
} from "../components/FolderSortableTree/FolderSortableTree";
import toastAction, { NOTIFICATIONS_TYPES } from "../utils/toastActions";

interface PageProps {
  data: TreeItems;
  title: string;
}

export default function Page(props: PageProps) {
  const onTreeStateChange = async (state: TreeItems, event: Event) => {
    switch (event.type) {
      case `ADD_NODE`: {
        try {
          toastAction({
            name: `users`,
            state: NOTIFICATIONS_TYPES.DEFAULT,
            message: "Adding user...",
          });
          await addUser({
            id: event.payload.id,
            firstName: event.payload.firstName,
            lastName: event.payload.lastName,
            parentId: event.payload.parentId || null,
            position: event.payload.position,
          });
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.SUCCESS });
        } catch (error: any) {
          toastAction({
            name: `users`,
            state: NOTIFICATIONS_TYPES.ERROR,
            message: error.message,
          });
        }
        break;
      }
      case `DELETE_NODE`: {
        toastAction({
          name: `users`,
          state: NOTIFICATIONS_TYPES.DEFAULT,
          message: "Deleting user...",
        });
        const res = await deleteUser(event.payload.id);
        if (res.status === 200) {
          toastAction({
            name: `users`,
            state: NOTIFICATIONS_TYPES.SUCCESS,
            message: "Deleted",
          });
        } else {
          toastAction({ name: `users`, state: NOTIFICATIONS_TYPES.ERROR });
        }
        break;
      }
      case `SORT`: {
        toastAction({
          name: `users`,
          state: NOTIFICATIONS_TYPES.DEFAULT,
          message: "Saving new position...",
        });
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
  };

  return (
    <>
      <Head>
        <title>{props.title} | NEST_NEXT</title>
        <meta name="description" content="Content" />
      </Head>
      <Main overflow="unset" pad="large" gap="medium">
        <Box direction="row" align="center" gap="small" justify="between">
          <Box direction="row" align="center" gap="small">
            <Heading
              size="medium"
              margin="none"
              style={{ overflowWrap: `anywhere` }}
            >
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
