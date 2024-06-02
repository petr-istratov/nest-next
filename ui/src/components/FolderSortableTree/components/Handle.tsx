import { forwardRef } from 'react';

import HandleIcon from '../../icons/HandleIcon';
import Action, { ActionProps } from './Action';

const Handle = forwardRef<HTMLButtonElement, ActionProps>((props, ref) => {
  return (
    <Action ref={ref} cursor="grab" {...props}>
      <HandleIcon />
    </Action>
  );
});

Handle.displayName = 'Handle';

export default Handle;
