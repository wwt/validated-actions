/**
 * Allow use of any here in order
 * to allow parameter and return types to
 * be interpretted correctly
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunc = (...args: any[]) => any;

export type TypedFunc<TFn extends AnyFunc> = (
  ...args: Parameters<TFn>
) => ReturnType<TFn>;

export type VoidFunc<TARGS extends unknown[] = []> = (...args: TARGS) => void;

export type ValidationFunction<TPayload> = (
  payload: TPayload,
) =>
  | TPayload
  | undefined
  | void
  | never
  | Promise<TPayload>
  | Promise<undefined>
  | Promise<void>
  | Promise<never>;
