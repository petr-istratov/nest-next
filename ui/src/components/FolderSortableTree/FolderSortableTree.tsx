'use client'
import { MouseEventHandler, createContext, useState } from 'react';
import { Box, Button } from 'grommet';
import styled from 'styled-components';

import { Event, TreeItems, TreeOptions } from './types/types';
import useTreeState from './hooks/useTreeState';
import SortableTree from './components/SortableTree';
import { Modal, ModalProps } from '../Modal';
import ModalAddUserBody from './components/ModalAddUserBody';

interface FolderSortableTreeProps {
  data: TreeItems;
  onChange: (state: TreeItems, event: Event) => void;
}

const Wrapper = styled.div`
  padding: 10px;
  margin-top: 50px;
`;

export const ConfigContext = createContext<any>(null);

const FolderSortableTree = (props: FolderSortableTreeProps) => {
  const [addModalOptions, setAddModalOptions] = useState<ModalProps | null>(null);
  const options: TreeOptions = {
    initOpenStatus: `OPEN`,
  };
  const { treeState, reducers } = useTreeState({ data: props.data, options, onChange: props.onChange });
  const { deleteNode, addNode, toggleOpen, reorder } = reducers;

  if (!treeState) return <></>;

  const handleAddUser = (parentId: string | null = null) => {
    setAddModalOptions({
      close: () => setAddModalOptions(null),
      buttons: [
        { title: `Cancel`, action: () => setAddModalOptions(null) },
        { title: `Add`, action: (event) => {
          const result = event.props.value;
          if (result.valid) {
            setAddModalOptions(null);
            addNode(parentId, { firstName: result.firstName, lastName: result.lastName })
          };
        }},
      ],
      title: `Enter name of the user`,
      body: () => {
        return ModalAddUserBody();
      },
    });
  }

  const configs = {
    handleDelete: deleteNode,
    handleAddNode: (parentId: string) => handleAddUser(parentId),
    handleToggleOpen: toggleOpen,
    handleSorting: reorder,
  };

  return (
    <ConfigContext.Provider value={configs}>
      <Box direction="row" gap="small" justify="end">
        <Button
          primary
          label="Add Independent User"
          onClick={() => handleAddUser()}
        />
      </Box>
      <Wrapper>
        <SortableTree items={treeState} collapsible removable />
      </Wrapper>
      {addModalOptions && <Modal {...addModalOptions}></Modal>}
    </ConfigContext.Provider>
  );
};

export * from './types/types';
export default FolderSortableTree;
