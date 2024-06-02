import { CSSProperties, forwardRef, HTMLAttributes } from 'react';
import styled from 'styled-components';

export interface ActionProps extends HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties[`cursor`];
  isCollapse?: boolean;
  collapsed?: boolean;
}

const Button = styled.button<{ $isCollapse?: boolean; $collapsed?: boolean }>`
  display: flex;
  width: 12px;
  padding: 15px;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  touch-action: none;
  cursor: var(--cursor, pointer);
  border-radius: 5px;
  border: none;
  outline: none;
  appearance: none;
  background-color: transparent;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) {
    &:hover {
      background-color: var(--action-background, rgba(0, 0, 0, 0.05));

      svg {
        fill: #6f7b88;
      }
    }
  }

  svg {
    flex: 0 0 auto;
    margin: auto;
    height: 100%;
    overflow: visible;
    fill: #919eab;
  }

  &:active {
    background-color: var(--background, rgba(0, 0, 0, 0.05));

    svg {
      fill: var(--fill, #788491);
    }
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0),
      0 0px 0px 2px #4c9ffe;
  }

  ${(props) =>
    props.$isCollapse &&
    `
    svg {
      transition: transform 250ms ease;
      ${props.$collapsed && `transform: rotate(-90deg);`}
    }
  `};
`;

const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ active, cursor, isCollapse, collapsed, ...props }, ref) => (
    <Button
      ref={ref}
      {...props}
      tabIndex={0}
      $isCollapse={isCollapse}
      $collapsed={collapsed}
      style={
        {
          cursor,
          '--fill': active?.fill,
          '--background': active?.background,
        } as CSSProperties
      }
    />
  ),
);

Action.displayName = 'Action';

export default Action;
