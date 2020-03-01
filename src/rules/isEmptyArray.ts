import { FilterFuncInterface, ValueGetterInterface } from "../";

export const isEmptyArray = (
  source: ValueGetterInterface<any[]>,
): FilterFuncInterface =>
  function(filter, element) {
    const filterValue = source({ filter, element });
    if (Array.isArray(filterValue)) return filterValue.length === 0;
    return undefined;
  };
