import {
  fieldFilterBuilder,
  FieldFilterBuilderInterface,
  FilterFuncInterface,
} from "../";

export const equalProps = ({
  filterField,
  targetField,
}: Omit<FieldFilterBuilderInterface, "callback">): FilterFuncInterface => {
  return fieldFilterBuilder({
    filterField,
    targetField,
    callback: (a, b) => a === b,
  });
};
