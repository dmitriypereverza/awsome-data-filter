import { path } from "ramda";

import { FilterFuncInterface } from "../";

export const someMatchInArray = ({
  condition,
  targetField,
}: {
  targetField: string;
  condition: FilterFuncInterface;
}): FilterFuncInterface => {
  return function(filter: any, source: any) {
    const targetArray = path(targetField.split("."), source) as [];
    if (!Array.isArray(targetArray)) return undefined;
    const booleans = targetArray
      .map(value => condition(filter, value))
      .filter(val => val !== undefined);

    if (booleans.length === 0) {
      return undefined;
    }

    return booleans.some(Boolean);
  };
};
