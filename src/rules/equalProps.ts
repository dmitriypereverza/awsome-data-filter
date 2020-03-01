import {
  fieldFilterBuilder,
  FilterFuncInterface,
  ValueGetterInterface,
} from "../";

export const equalProps = (
  target: ValueGetterInterface<string>,
  source: ValueGetterInterface<string>,
): FilterFuncInterface =>
  fieldFilterBuilder({
    firstOperand: target,
    secondOperand: source,
    callback: (targetValue, sourceValue) => targetValue === sourceValue,
  });
