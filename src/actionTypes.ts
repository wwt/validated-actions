export type Action<
  TType extends string = string,
  TPayload extends unknown = unknown,
  TCustomActionProps extends Record<string, unknown> = Record<string, unknown>
> = {
  type: TType;
  payload: TPayload;
} & TCustomActionProps;
