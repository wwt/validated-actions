import { Middleware } from 'redux';
import { isValidateableAction } from './createValidateableAction';
import { VALIDATE } from './VALIDATE';

export const createValidateActionsMiddleware: <RootState>() => Middleware<
  unknown,
  RootState
> = () => () => (next) => (action) => {
  return isValidateableAction(action) ? action[VALIDATE](next) : next(action);
};

export default createValidateActionsMiddleware;
