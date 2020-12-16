import { Action } from './actionTypes';
import { ValidationFunction, VoidFunc } from './functionTypes';

export const createValidation = <
  TPayload,
  TValidationError,
  TFailureType extends string = string,
  TType extends string = string,
  TCustomActionProps extends Record<string, unknown> = Record<string, unknown>
>(
  originalAction: Action<TType, TPayload, TCustomActionProps>,
  validationFunction: ValidationFunction<TPayload>,
  onValidationFailureActionCreator: (
    failure: TValidationError,
  ) => Action<TFailureType, TValidationError>,
) => async (next: VoidFunc<[Action]>) => {
  const { payload } = originalAction;
  try {
    const newPayload = (await validationFunction(payload)) || payload;
    next({ ...originalAction, payload: newPayload });
  } catch (validationFailure) {
    next(onValidationFailureActionCreator(validationFailure));
  }
};
