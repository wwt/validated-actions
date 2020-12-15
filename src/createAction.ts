export type Action<
  TType extends string,
  TPayload,
  TCustomAction extends Record<string, unknown>
> = {
  type: TType;
  payload: TPayload;
} & TCustomAction;

export type ActionCreator<
  TType extends string,
  TPayload,
  TCustomAction extends Record<string, unknown>
> = ((
  payload: TPayload,
) => {
  type: TType;
  payload: TPayload;
} & TCustomAction) & { getType: () => TType; getString: () => TType };

export const createAction = <
  TPayload,
  TCustomAction extends Record<string, unknown> = Record<string, unknown>,
  TType extends string = string
>(
  type: TType,
  customActionCreator?: (payload: TPayload) => TCustomAction,
): ActionCreator<TType, TPayload, TCustomAction> =>
  Object.assign(
    (payload: TPayload): Action<TType, TPayload, TCustomAction> => ({
      type,
      payload,
      ...(customActionCreator ? customActionCreator(payload) : ({} as TCustomAction)),
    }),
    { getType: () => type, getString: () => type },
  );
