import {
  fieldFilterBuilder,
  FilterFuncInterface,
  ValueGetterInterface,
} from "../";

export const lessThen = (
  target: ValueGetterInterface<string | number>,
  source: ValueGetterInterface<string | number>,
): FilterFuncInterface =>
  fieldFilterBuilder({
    firstOperand: target,
    secondOperand: source,
    callback: (targetValue, sourceValue) => targetValue < sourceValue,
  });
