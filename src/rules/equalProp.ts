import {
  fieldFilterBuilder,
  FilterFuncInterface,
  ValueGetterInterface,
} from "../";

export const equalProp = (
  target: ValueGetterInterface<any>,
  source: ValueGetterInterface<any>,
): FilterFuncInterface =>
  fieldFilterBuilder({
    firstOperand: target,
    secondOperand: source,
    callback: (targetValue, sourceValue) => targetValue === sourceValue,
  });
