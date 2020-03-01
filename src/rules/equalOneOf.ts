import { FilterFuncInterface, ValueGetterInterface } from "../";

export const equalOneOf = (
  source: ValueGetterInterface<any>,
  targets: ValueGetterInterface<any>[],
): FilterFuncInterface =>
  function(filter, element) {
    const sourceValue = source({ filter, element });
    return targets.some(target => target({ filter, element }) === sourceValue);
  };
