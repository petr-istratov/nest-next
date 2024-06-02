import type { UniqueIdentifier } from '@dnd-kit/core';
import type { MutableRefObject } from 'react';

export interface TreeItem {
  id: UniqueIdentifier;
  firstName: string;
  lastName: string;
  children?: TreeItem[];
  collapsed?: boolean;
  position: number;
  parentId?: UniqueIdentifier | null;
}

export type TreeItems = TreeItem[];

export type TreeOptions = {
  initOpenStatus?: `OPEN` | `CLOSED`;
};

export type EventName =
  | `INITIALIZATION`
  | `ADD_NODE`
  | `TOGGLE_OPEN`
  | `DELETE_NODE`
  | `SORT`;

export interface Event {
  type: EventName;
  id: UniqueIdentifier | null;
  params: any[];
  payload: any;
}

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
