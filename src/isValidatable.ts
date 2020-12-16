import { VALIDATE } from './constants';
import { AnyFunc } from './functionTypes';

type Validatable = { [VALIDATE]: (next: AnyFunc) => void };

export const isValidatable = (action: unknown): action is Validatable => {
  if (
    typeof action === 'object' &&
    typeof (action as { [VALIDATE]: unknown })[VALIDATE] === 'function'
  ) {
    return true;
  }
  return false;
};
