import { Button, Card, CardBody, CardFooter, CardHeader, Text } from "grommet";
import { ReactNode } from "react";
import styled from "styled-components";

const Hover = styled.div`
  background-color: #0000004e;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 9;
  inset: 0 0;
  > div {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }
`;
const ModalCard = styled(Card)`
  max-height: 100%;
`;
export interface ModalProps {
  close: () => void;
  buttons: {
    action: (event: any) => Promise<void> | void;
    title: string;
    primary?: boolean;
  }[];
  body: () => ReactNode;
  title: string;
}

export const Modal = (props: ModalProps) => {
  const body = props.body();
  return (
    <Hover
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        props.close();
      }}
    >
      <ModalCard pad={`10px`} background={`white`}>
        <CardHeader justify="around" align="center">
          <Text textAlign="center" weight={`bold`}>
            {props.title}
          </Text>
        </CardHeader>
        <CardBody pad="10px 0">{body}</CardBody>
        <CardFooter justify="center">
          {props.buttons.map((button, key) => (
            <Button
              key={key}
              primary={button.primary}
              label={button.title}
              onClick={() => void button.action(body)}
            />
          ))}
        </CardFooter>
      </ModalCard>
    </Hover>
  );
};
