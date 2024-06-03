import { toast } from "react-toastify";

export enum NOTIFICATIONS_TYPES {
  SUCCESS = "success",
  ERROR = "error",
  DEFAULT = "default",
  WARNING = "warning",
}

const toastAction = (options: {
  name: string;
  message?: string;
  state: NOTIFICATIONS_TYPES;
  callback?: () => void;
}) => {
  switch (options.state) {
    case NOTIFICATIONS_TYPES.DEFAULT:
      toast.info(options.message ? options.message : `Saving...`, {
        type: NOTIFICATIONS_TYPES.DEFAULT,
        isLoading: true,
        toastId: options.name,
      });
      options.callback?.();
      break;
    case NOTIFICATIONS_TYPES.WARNING:
      toast.info(options.message ? options.message : `Warning...`, {
        type: NOTIFICATIONS_TYPES.WARNING,
        isLoading: false,
        toastId: options.name,
        autoClose: 2000,
      });
      options.callback?.();
      break;

    case NOTIFICATIONS_TYPES.SUCCESS:
      toast.update(options.name, {
        type: NOTIFICATIONS_TYPES.SUCCESS,
        isLoading: false,
        render: options.message ? options.message : `Saved!`,
        autoClose: 2000,
      });
      options.callback?.();
      break;

    case NOTIFICATIONS_TYPES.ERROR:
      toast.update(options.name, {
        type: NOTIFICATIONS_TYPES.ERROR,
        isLoading: false,
        render: options.message ? options.message : `Unable to save!`,
        autoClose: 2000,
      });
      options.callback?.();
      break;

    default:
      break;
  }
};

export default toastAction;
