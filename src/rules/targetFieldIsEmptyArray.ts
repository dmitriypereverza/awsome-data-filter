import { FilterFuncInterface } from "../";
import { path } from "ramda";

export const isEmptyArrayField = ({
  targetField,
}: {
  targetField: string;
}): FilterFuncInterface =>
  function(_, data: any) {
    const targetValue = path(targetField.split("."), data);
    if (!Array.isArray(targetValue)) return undefined;
    return targetValue.length === 0;
  };
