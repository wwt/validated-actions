import { AnyFunc, TypedFunc } from './functionTypes';

export const withProperties = <TProps>(objWithProps: TProps) => <
  TActionCreator extends AnyFunc
>(
  actionCreator: TActionCreator,
): TypedFunc<TActionCreator> & TProps =>
  Object.assign(actionCreator, {
    ...objWithProps,
  });
