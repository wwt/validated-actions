import { Middleware } from 'redux';
import { VALIDATE } from './constants';
import { isValidatable } from './isValidatable';

export const createValidateActionsMiddleware: <RootState>() => Middleware<
  unknown,
  RootState
> = () => (store) => (next) => (action) => {
  const dispatchIfDifferentAction = (nextAction: { type: string }) => {
    const actionHandler =
      nextAction.type === action.type ? next : store.dispatch;
    return actionHandler(nextAction);
  };
  return isValidatable(action)
    ? action[VALIDATE](dispatchIfDifferentAction)
    : next(action);
};

export default createValidateActionsMiddleware;
