import type { UniqueIdentifier } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Menu } from "grommet";
import { More } from "grommet-icons";
import React, { forwardRef, HTMLAttributes, Ref } from "react";
import styled from "styled-components";

import CollapseIcon from "../../icons/CollapseIcon";
import Action from "./Action";
import Handle from "./Handle";

export interface TreeItemProps
  extends Omit<HTMLAttributes<HTMLLIElement>, `id`> {
  id: UniqueIdentifier;
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indentationWidth: number;
  value: string;
  onCollapse?: (isOpen: boolean) => void;
  onRemove?(): void;
  onAddNode?(): void;
  wrapperRef?: Ref<HTMLLIElement>;
}

const Wrapper = styled(motion.li)<{
  $clone: boolean;
  $ghost: boolean;
  $disableInteraction: boolean;
}>`
  list-style: none;
  box-sizing: border-box;
  padding-left: var(--spacing);
  margin-bottom: -1px;
  ${(props) =>
    props.$clone &&
    `
    display: inline-block;
    pointer-events: none;
    padding: 0;
    padding-left: 10px;
    padding-top: 5px;
  `};
  ${(props) =>
    props.$ghost &&
    `
    opacity: 0.5;
  `};
  ${(props) =>
    props.$disableInteraction &&
    `
    pointer-events: none;
  `};
`;

const Item = styled.div`
  --vertical-padding: 0;
  min-height: 66px;

  position: relative;
  display: flex;
  align-items: center;
  padding: var(--vertical-padding) 10px;
  background-color: #232323;
  border: 1px solid #9e9e9e;
  color: #d6d6d6;
  box-sizing: border-box;
  border-radius: 10px;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: 0.5rem;
`;

const Count = styled.span`
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #2389ff;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
`;

const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      id,
      childCount,
      clone,
      depth,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      collapsed,
      onCollapse,
      onRemove,
      onAddNode,
      style,
      value,
      wrapperRef,
    },
    ref,
  ) => {
    const closeMe = () => onCollapse && onCollapse(false);
    const openMe = () => onCollapse && onCollapse(true);

    const addUser = () => {
      openMe();
      onAddNode && onAddNode();
    };

    return (
      <Wrapper
        id={`treeItemId_${id}`}
        $clone={!!clone}
        $ghost={!!ghost}
        $disableInteraction={!!disableInteraction}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: `auto` }}
        exit={{ opacity: 0, height: 0 }}
        ref={wrapperRef}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
      >
        <Item ref={ref} style={style}>
          <Handle {...handleProps} />
          {!!childCount && childCount > 0 && (
            <Action
              onClick={collapsed ? openMe : closeMe}
              isCollapse
              collapsed={collapsed}
            >
              <CollapseIcon />
            </Action>
          )}
          <NameContainer>{value}</NameContainer>
          {!clone && (
            <Menu
              icon={<More />}
              items={[
                { label: `Add User`, onClick: addUser },
                ...(onRemove
                  ? [{ label: `Delete`, onClick: () => onRemove() }]
                  : []),
              ]}
            />
          )}
          {childCount && childCount > 0 ? <Count>{childCount}</Count> : null}
        </Item>
      </Wrapper>
    );
  },
);

TreeItem.displayName = "TreeItem";

export default TreeItem;
