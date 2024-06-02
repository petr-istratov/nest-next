import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidV4 } from 'uuid';

import type { EventName, TreeItems, TreeItem, FlattenedItem } from '../types/types';

const sort = (field: string, dir = 'asc') => (xs) => 
  [...xs].sort (dir == 'asc'
    ? ({ [field]: a }, { [field]: b }) => a < b ? -1 : a > b ?  1 : 0         
    : ({ [field]: a }, { [field]: b }) => a < b ?  1 : a > b ? -1 : 0         
  )

const sortRecursive = (childField: string) => (sort) => (xs) =>
  sort([...xs]).map(({[childField]: cf, ...rest}) => ({
    ...rest, 
    [childField]: sortRecursive(childField)(sort)(cf)
  }));



// Build a reusable sort function
const mySort = sortRecursive('children')(sort('position')) // defaults to ascending


const deepClone = (x: any) => JSON.parse(JSON.stringify(x));

const addItem = (
  items: TreeItems,
  { parentId, firstName, lastName }: { parentId: UniqueIdentifier; firstName: string, lastName: string },
) => {
  let newItems: TreeItems = [];
  let payload;

  const getPayload = (nodes: TreeItems) => ({
    id: uuidV4(),
    firstName,
    lastName,
    children: [],
    collapsed: true,
    editing: true,
    position: nodes.length > 0 ? Math.max(...nodes.map((item) => item.position)) + 1 : 0,
  });

  if (parentId === null) {
    payload = getPayload(items);
    newItems = [...items, payload];
  } else {
    for (const item of items) {
      if (item.id === parentId && item.children) {
        payload = getPayload(item.children);
        item.children = [...item.children, payload];
      } else if (item.children && item.children.length) {
        const result: { newItems: TreeItems; payload?: TreeItem } = addItem(item.children, { parentId, firstName, lastName });
        item.children = result.newItems;
        if (!payload) payload = result.payload;
      }

      newItems.push(item);
    }
  }

  return { newItems, payload };
};

const removeItem = (items: TreeItems, id: UniqueIdentifier) => {
  const newItems: TreeItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children && item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
};

export const addNode = (
  rootNodes: TreeItems,
  parentId: UniqueIdentifier,
  { firstName, lastName }: { firstName: string; lastName: string },
) => {
  const { newItems, payload } = addItem(rootNodes || [], { parentId, firstName, lastName });
  return { state: [...newItems], payload: { parentId, ...payload } };
};

export const deleteNode = (rootNodes: TreeItems, id: UniqueIdentifier) => {
  const newItems = removeItem(rootNodes || [], id);

  return { state: [...newItems], payload: { id } };
};

export const getEvent = (eventName: EventName, id: UniqueIdentifier | null, payload: any, ...params: any) => ({
  type: eventName,
  id,
  params,
  payload,
});

export const setProperty = <T extends keyof TreeItem>(
  items: TreeItems,
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T],
) => {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children && item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
};

export const reorder = (
  rootNodes: TreeItems,
  id: UniqueIdentifier,
  {
    sortedItems,
    newParentId,
    newPosition,
  }: {
    sortedItems: TreeItems;
    newParentId: UniqueIdentifier;
    newPosition: number;
  },
) => {
  const newItems = setProperty(sortedItems || [], id, `position`, () => newPosition);
  return { state: [...newItems], payload: { id, newParentId, newPosition } };
};

const setTreeState: (tree: TreeItems, collapsed: boolean) => TreeItems = (tree, collapsed) => {
  const newTree = [];

  for (const node of tree) {
    newTree.push({
      id: node.id,
      firstName: node.firstName,
      lastName: node.lastName,
      collapsed,
      children: setTreeState(node.children || [], collapsed),
      position: node.position,
    });
  }

  return newTree;
};

export const toggleOpen = (rootNodes: TreeItems, id: UniqueIdentifier, { isOpen }: { isOpen: boolean }) => {
  const newItems = setProperty(rootNodes || [], id, `collapsed`, () => !isOpen);
  return { state: [...newItems] };
};

const isValidCollapsedStatus = (node: TreeItem) => {
  const { children, collapsed } = node;

  if (children && collapsed === undefined) return false; // Parent node needs to have 'collapsed'
  if (children?.length === 0 && collapsed !== undefined) return false; // Children can't have 'collapsed'

  if (children) {
    for (const child of children) {
      if (!isValidCollapsedStatus(child)) return false;
    }
  }

  return true;
};

export const initializeTreeState = (data: TreeItems, initOpenStatus = `OPEN`) => {
  let initState = mySort(deepClone({ data }).data);

  switch (initOpenStatus) {
    case `OPEN`:
      initState = setTreeState(initState, false);
      break;

    case `CLOSED`:
      initState = setTreeState(initState, true);
      break;

    default:
      if (!isValidCollapsedStatus(initState)) {
        initState = setTreeState(initState, false);
      }
  }

  return initState;
};

export const findItem = (items: TreeItem[], itemId: UniqueIdentifier) => {
  return items.find(({ id }) => id === itemId);
};

export const buildTree = (flattenedItems: FlattenedItem[]): TreeItems => {
  const root: { id: string; children: TreeItems } = { id: `root`, children: [] };
  const nodes: Record<string, typeof root> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id: String(id), children };
    parent.children.push(item);
  }

  return root.children;
};

const flatten = (items: TreeItems, parentId: UniqueIdentifier | null = null, depth = 0): FlattenedItem[] => {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...(item.children ? flatten(item.children, item.id, depth + 1) : []),
    ];
  }, []);
};

export const flattenTree = (items: TreeItems): FlattenedItem[] => {
  return flatten(items);
};

export const findItemDeep = (items: TreeItems, itemId: UniqueIdentifier): TreeItem | undefined => {
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) {
      return item;
    }

    if (children && children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
};

const countChildren = (items: TreeItem[], count = 0): number => {
  if (!items) return 0;
  return items.reduce((acc, { children }) => {
    if (children && children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
};

export const getChildCount = (items: TreeItems, id: UniqueIdentifier) => {
  const item = findItemDeep(items, id);

  return item ? countChildren(item.children || []) : 0;
};

const getDragDepth = (offset: number, indentationWidth: number) => {
  return Math.round(offset / indentationWidth);
};

const getMaxDepth = ({ previousItem }: { previousItem: FlattenedItem }) => {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
};

const getMinDepth = ({ nextItem }: { nextItem: FlattenedItem }) => {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
};

export const getProjection = (
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number,
) => {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  const getParentId = () => {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item: FlattenedItem) => item.depth === depth)?.parentId;

    return newParent ?? null;
  };

  return { depth, maxDepth, minDepth, parentId: getParentId(), previousItem, nextItem };
};

export const removeChildrenOf = (items: FlattenedItem[], ids: UniqueIdentifier[]) => {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children && item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
};
