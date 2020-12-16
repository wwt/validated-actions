export type TypeProperties<TType extends string = string> = {
  getType: () => TType;
  getString: () => TType;
};

export const getTypeProperties = <TType extends string>(
  type: TType,
): TypeProperties<TType> => ({
  getType: () => type,
  getString: () => type,
});
