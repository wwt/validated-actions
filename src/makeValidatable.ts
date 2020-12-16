import { Action } from './actionTypes';
import { VALIDATE } from './constants';
import { createValidation } from './createValidation';
import { ValidationFunction } from './functionTypes';
import { getTypeProperties } from './getTypeProperties';
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
) => <TValidationError, TFailureType extends string>(
  failureType: TFailureType,
  validationFunction: ValidationFunction<TPayload>,
) => {
  const onValidationFailureAction = withProperties(
    getTypeProperties(failureType),
  )((validationFailure: TValidationError) => ({
    type: failureType,
    payload: validationFailure,
  }));

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
