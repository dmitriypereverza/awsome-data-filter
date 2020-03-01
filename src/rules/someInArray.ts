import { FilterFuncInterface, ValueGetterInterface } from "../";

export const someInArray = (
  source: ValueGetterInterface<string>,
  condition: FilterFuncInterface
): FilterFuncInterface => function(filter: any, element: any) {
  const sourceArray = source({ filter, element });
  if (!Array.isArray(sourceArray)) return undefined;
  const booleans = sourceArray
    .map(value => condition(filter, value))
    .filter(val => val !== undefined);

  if (booleans.length === 0) {
    return undefined;
  }

  return booleans.some(Boolean);
};
