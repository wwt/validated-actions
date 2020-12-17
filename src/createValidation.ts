import { Action } from './actionTypes';
import { AnyFunc, ValidationFunction, VoidFunc } from './functionTypes';

export const createValidation = <
  TPayload,
  TValidationActionCreator extends AnyFunc,
  TType extends string = string,
  TCustomActionProps extends Record<string, unknown> = Record<string, unknown>
>(
  originalAction: Action<TType, TPayload, TCustomActionProps>,
  validationFunction: ValidationFunction<TPayload>,
  onValidationFailureActionCreator: TValidationActionCreator,
) => async (next: VoidFunc<[Action]>) => {
  const { payload } = originalAction;
  try {
    const newPayload = (await validationFunction(payload)) || payload;
    next({ ...originalAction, payload: newPayload });
  } catch (validationFailure) {
    next(onValidationFailureActionCreator(validationFailure));
  }
};
