import { Middleware } from 'redux';
import { VALIDATE } from './constants';
import { isValidatable } from './isValidatable';

export const createValidateActionsMiddleware: <RootState>() => Middleware<
  unknown,
  RootState
> = () => () => (next) => (action) => {
  return isValidatable(action) ? action[VALIDATE](next) : next(action);
};

export default createValidateActionsMiddleware;
