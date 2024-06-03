import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MeasuringStrategy,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence } from "framer-motion";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import toastAction, { NOTIFICATIONS_TYPES } from "../../../utils/toastActions";
import { Modal, ModalProps } from "../../Modal";
import { ConfigContext } from "../FolderSortableTree";
import type { FlattenedItem, SensorContext, TreeItems } from "../types/types";
import {
  buildTree,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
} from "../utils/utils";
import SortableTreeItem from "./SortableTreeItem";

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: `ease-out`,
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

interface SortableTreeProps {
  collapsible?: boolean;
  items: TreeItems;
  indentationWidth?: number;
  removable?: boolean;
}

const SortableTree = ({ items, indentationWidth = 25 }: SortableTreeProps) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [confirmDeleteModalOptions, setConfirmDeleteModalOptions] =
    useState<ModalProps | null>(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items || []);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        (collapsed && children && children.length
          ? [...acc, id]
          : acc) as string[],
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    );
  }, [activeId, items]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
        )
      : null;

  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems],
  );

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const resetState = () => {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.style.setProperty(`cursor`, ``);
  };

  const handleDragStart = ({ active: { id: activeId } }: DragStartEvent) => {
    setActiveId(activeId);
    setOverId(activeId);

    document.body.style.setProperty(`cursor`, `grabbing`);
  };

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    resetState();

    if (projected && over) {
      const { depth, parentId, previousItem, nextItem } = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items || [])),
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      const previousItemPosition =
        previousItem?.depth === depth ? previousItem.position : null;
      const nextItemPosition =
        nextItem?.depth === depth ? nextItem.position : null;

      let position = 0;

      if (previousItemPosition === null && nextItemPosition !== null) {
        position = nextItemPosition - 1;
      } else if (previousItemPosition !== null && nextItemPosition === null) {
        position = previousItemPosition + 1;
      } else if (previousItemPosition !== null && nextItemPosition !== null) {
        position = (previousItemPosition + nextItemPosition) / 2;
      }

      if (
        activeTreeItem.position !== position ||
        activeTreeItem.parentId !== parentId
      ) {
        handleSorting(activeTreeItem.id, {
          sortedItems: newItems,
          newParentId: parentId,
          newPosition: position,
        });
      }
    }
  };

  const handleDragCancel = () => {
    resetState();
  };

  const handleRemove = (id: UniqueIdentifier, childCount) => {
    if (childCount > 0) {
      toastAction({
        name: `declineDelete`,
        message: `Can not delete user, which has subordinates`,
        state: NOTIFICATIONS_TYPES.WARNING,
      });
      return;
    }
    setConfirmDeleteModalOptions({
      close: () => setConfirmDeleteModalOptions(null),
      buttons: [
        { title: `Cancel`, action: () => setConfirmDeleteModalOptions(null) },
        {
          title: `Delete`,
          action: () => {
            handleDelete(id);
            setConfirmDeleteModalOptions(null);
          },
        },
      ],
      title: `Delete confirmation`,
      body: () => <>{`Are you sure you want to delete the user?`}</>,
    });
  };

  const { handleToggleOpen, handleDelete, handleSorting, handleAddNode } =
    useContext(ConfigContext);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortedIds}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {flattenedItems.map(
              ({ id, firstName, lastName, collapsed, depth }) => {
                const childCount = getChildCount(items, id);
                return (
                  <SortableTreeItem
                    key={id}
                    id={id}
                    value={`${firstName} ${lastName}`}
                    depth={
                      id === activeId && projected ? projected.depth : depth
                    }
                    indentationWidth={indentationWidth}
                    collapsed={Boolean(collapsed)}
                    childCount={items && childCount}
                    onCollapse={(isOpen: boolean) =>
                      handleToggleOpen(id, { isOpen })
                    }
                    onRemove={() => handleRemove(id, childCount)}
                    onAddNode={() => handleAddNode(id)}
                  />
                );
              },
            )}
          </AnimatePresence>
          {createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeId && activeItem ? (
                <SortableTreeItem
                  id={activeId}
                  depth={activeItem.depth}
                  clone
                  childCount={getChildCount(items || [], activeId)}
                  value={`${activeItem.firstName} ${activeItem.lastName}`}
                  indentationWidth={indentationWidth}
                />
              ) : null}
            </DragOverlay>,
            document.body,
          )}
        </SortableContext>
      </DndContext>
      {confirmDeleteModalOptions && (
        <Modal {...confirmDeleteModalOptions}></Modal>
      )}
    </>
  );
};

export default SortableTree;
