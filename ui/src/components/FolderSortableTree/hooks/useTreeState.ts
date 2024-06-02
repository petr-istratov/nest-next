import { useEffect, useState } from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { scroller } from 'react-scroll';

import { Event, EventName, TreeItems, TreeOptions } from '../types/types';
import {
  addNode,
  deleteNode,
  getEvent,
  reorder,
  toggleOpen,
  initializeTreeState,
} from '../utils/utils';

interface Props {
  data: TreeItems;
  onChange: (state: TreeItems, event: Event) => void;
  options?: TreeOptions;
}

interface Reducers {
  deleteNode: (id: UniqueIdentifier, ...args: any) => void;
  addNode: (parentId: UniqueIdentifier | null, ...args: any) => void;
  toggleOpen: (id: UniqueIdentifier, ...args: any) => void;
  reorder: (id: UniqueIdentifier, ...args: any) => void;
}

const useTreeState = ({ data, onChange, options = {} }: Props) => {
  const [treeState, setTreeState] = useState<TreeItems | null>(null);
  const [event, setEvent] = useState<Event>({
    type: `INITIALIZATION`,
    id: null,
    params: [],
    payload: {},
  });

  const { initOpenStatus } = options;

  useEffect(() => {
    const initState = initializeTreeState(data, initOpenStatus);
    setTreeState(initState);
  }, [data, initOpenStatus]);

  useEffect(() => {
    if (typeof onChange === `function` && treeState && event) {
      onChange(treeState, event);

      if (event.type === `ADD_NODE`) {
        const elementId = `treeItemId_${event.payload.id}`;
        const treeItemElement = document.getElementById(elementId);
        if (!treeItemElement) return;
        const treeItemBottomEdge = treeItemElement.offsetTop + treeItemElement.offsetHeight;
        const bodyOffsetFinish = window.scrollY + window.innerHeight;

        if (treeItemBottomEdge > bodyOffsetFinish) {
          scroller.scrollTo(elementId, {
            duration: 500,
            delay: 100,
            smooth: true,
          });
        }
      }
    }
  }, [treeState, event, onChange]);

  const getExternalReducer =
    (reducer: any, name: EventName) =>
    (id: UniqueIdentifier | null, ...args: any) => {
      const { state: newState, payload = {} } = reducer(treeState, id, ...args);
      const event = getEvent(name, id, payload, ...args);

      setEvent(event);
      setTreeState(newState);
    };

  const reducers: Reducers = {
    deleteNode: getExternalReducer(deleteNode, `DELETE_NODE`),
    addNode: getExternalReducer(addNode, `ADD_NODE`),
    toggleOpen: getExternalReducer(toggleOpen, `TOGGLE_OPEN`),
    reorder: getExternalReducer(reorder, `SORT`),
  };

  return {
    treeState,
    reducers,
  };
}

export default useTreeState;
