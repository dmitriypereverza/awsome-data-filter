import {
  fieldFilterBuilder,
  FilterFuncInterface,
  ValueGetterInterface,
} from "../";

export const matchText = (
  needle: ValueGetterInterface<string>,
  source: ValueGetterInterface<string>,
): FilterFuncInterface =>
  fieldFilterBuilder({
    firstOperand: needle,
    secondOperand: source,
    callback: (needleValue, sourceValue) => {
      if (typeof sourceValue !== "string") {
        return false;
      }
      sourceValue = sourceValue.toString().toLowerCase();
      needleValue = needleValue.toString().toLowerCase();
      return !!sourceValue.includes(needleValue);
    },
  });
