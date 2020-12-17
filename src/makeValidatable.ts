import { Action } from './actionTypes';
import { VALIDATE } from './constants';
import { createValidation } from './createValidation';
import { ValidationFunction } from './functionTypes';
import { withProperties } from './withProperties';

type ActionCreator<
  TType extends string,
  TPayload extends unknown,
  TCustomActionProps extends Record<string, unknown>,
  TArgs extends unknown[]
> = (...args: TArgs) => Action<TType, TPayload, TCustomActionProps>;

export const makeValidatable = <
  TType extends string,
  TPayload extends unknown,
  TCustomActionProps extends Record<string, unknown>,
  TArgs extends unknown[],
  TOriginalActionCreatorMetadata
>(
  originalActionCreator: ActionCreator<
    TType,
    TPayload,
    TCustomActionProps,
    TArgs
  > &
    TOriginalActionCreatorMetadata,
) => <
  TFailureType extends string,
  TValidationError extends unknown,
  TCustomFailureActionProps extends Record<string, unknown>,
  TFailureArgs extends unknown[],
  TFailureActionCreatorMetadata
>(
  validationFunction: ValidationFunction<TPayload>,
  onValidationFailureAction: ActionCreator<
    TFailureType,
    TValidationError,
    TCustomFailureActionProps,
    TFailureArgs
  > &
    TFailureActionCreatorMetadata,
) => {
  return withProperties({
    ...originalActionCreator,
    onValidationFailureAction,
  })((...args: TArgs) => {
    const originalAction = originalActionCreator(...args);
    return {
      ...originalAction,
      [VALIDATE]: createValidation(
        originalAction,
        validationFunction,
        onValidationFailureAction,
      ),
    };
  });
};
