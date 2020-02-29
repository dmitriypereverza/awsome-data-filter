import { FilterFuncInterface } from "../";
import { path } from "ramda";

export const targetFieldEqualsFilterValue = ({
  targetField,
}: {
  targetField: string;
}): FilterFuncInterface =>
  function(filter: any, data: any) {
    if (filter === undefined) return undefined;
    const target = path(targetField.split("."), data);
    if (target === undefined) return undefined;
    return target === filter;
  };
