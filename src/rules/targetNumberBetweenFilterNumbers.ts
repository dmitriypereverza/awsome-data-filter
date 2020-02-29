import { isNil } from "ramda";

import {
  fieldFilterBuilder,
  FieldFilterBuilderInterface,
  FilterFuncInterface,
} from "../";

export const targetNumberBetweenFilterNumbers = ({
  filterField,
  targetField,
}: Omit<FieldFilterBuilderInterface, "callback">): FilterFuncInterface => {
  return fieldFilterBuilder({
    filterField,
    targetField,
    callback: (
      filter: {
        valueFrom: number;
        valueTo: number;
      },
      currentNumber: number | string,
    ) => {
      if (isNil(filter.valueFrom) && isNil(filter.valueTo)) {
        return undefined;
      }
      currentNumber = parseFloat(currentNumber.toString());
      return (
        (!filter.valueFrom || filter.valueFrom <= currentNumber) &&
        (!filter.valueTo || filter.valueTo >= currentNumber)
      );
    },
  });
};
