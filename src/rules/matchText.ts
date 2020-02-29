import {
  fieldFilterBuilder,
  FieldFilterBuilderInterface,
  FilterFuncInterface,
} from "../";

export const matchText = ({
  filterField,
  targetField,
}: Omit<FieldFilterBuilderInterface, "callback">): FilterFuncInterface =>
  fieldFilterBuilder({
    filterField,
    targetField,
    callback: (filter, target) => {
      if (typeof target !== "string") {
        return false;
      }
      target = target.toString().toLowerCase();
      filter = filter.toString().toLowerCase();
      return !!target.includes(filter);
    },
  });
