import { path } from "ramda";

import { FilterFuncInterface } from "../";

export const someMatchInFilterArray = ({
  condition,
  filterField,
}: {
  filterField: string;
  condition: FilterFuncInterface;
}): FilterFuncInterface => {
  return function(filter: any, source: any) {
    const filterArray = path(filterField.split("."), filter) as [];
    if (!Array.isArray(filterArray)) return undefined;
    return filterArray.some(filterValue => condition(filterValue, source));
  };
};
