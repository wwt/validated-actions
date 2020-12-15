import { Middleware } from 'redux';
import { ActionCreator, createAction } from './createAction';
import { VALIDATE } from './VALIDATE';

// I don't like this
type Dispatch = Parameters<ReturnType<Middleware>>[0];

type ValidationFunctionResponse<T> =
  | Promise<T | undefined | null | true>
  | T
  | undefined
  | null
  | true;

type Validatable = {
  [VALIDATE]: (next: Dispatch) => void;
};

type ValidationActionCreator<
  TType extends string,
  TTypeError extends string,
  TPayload,
  TValidationError
> = ActionCreator<TType, TPayload, Validatable> & {
  onValidationSuccessAction: ActionCreator<TType, TPayload, Record<string, unknown>>;
  onValidationFailureAction: ActionCreator<TTypeError, TValidationError, Record<string, unknown>>;
};

export const createValidatableAction = <
  TType extends string,
  TTypeError extends string,
  TPayload,
  TValidationError
>(
  [type, errorType]: [TType, TTypeError],
  validationFn: (payload: TPayload) => ValidationFunctionResponse<TValidationError> = () =>
    undefined,
): ValidationActionCreator<TType, TTypeError, TPayload, TValidationError> => {
  const onValidationSuccessAction = createAction<TPayload, Record<string, unknown>, TType>(type);
  const onValidationFailureAction = createAction<
    TValidationError,
    Record<string, unknown>,
    TTypeError
  >(errorType);
  const actionWithValidation = createAction<TPayload, Validatable, TType>(type, (payload) => ({
    payload,
    [VALIDATE]: async (next: Dispatch) => {
      try {
        const validationResults = await validationFn(payload);
        const nextAction =
          validationResults === true ||
          validationResults === null ||
          validationResults === undefined
            ? onValidationSuccessAction(payload)
            : onValidationFailureAction(validationResults);
        next(nextAction);
      } catch (err: unknown) {
        next(onValidationFailureAction(err as TValidationError));
      }
    },
  }));
  return Object.assign(actionWithValidation, {
    onValidationSuccessAction,
    onValidationFailureAction,
  });
};

type ValidatableAction = { [VALIDATE]: (next: Dispatch) => void };
export const isValidateableAction = (action: unknown): action is ValidatableAction => {
  if (
    typeof action === 'object' &&
    typeof (action as { [VALIDATE]: unknown })[VALIDATE] === 'function'
  ) {
    return true;
  }
  return false;
};

export default createValidatableAction;
