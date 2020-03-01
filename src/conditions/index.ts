import { FilterFuncInterface, LogicalOperator } from "../index";

const composeFilters = (
  logicalOperator: LogicalOperator,
  filters: FilterFuncInterface[],
): FilterFuncInterface =>
  function(filter: any, source: any, valueWhenNotFilter = undefined) {
    let filterFunc;
    let result = valueWhenNotFilter;
    for (let i = 0; i < filters.length; i++) {
      filterFunc = filters[i];
      const filterResult = filterFunc(filter, source);
      if (filterResult === undefined) continue;
      if (logicalOperator === LogicalOperator.OR && filterResult) {
        return true;
      }
      if (logicalOperator === LogicalOperator.AND && !filterResult) {
        return false;
      }
      result = filterResult;
    }
    return result;
  };

export function and(conditions: FilterFuncInterface[]) {
  return composeFilters(LogicalOperator.AND, conditions);
}
export function or(conditions: FilterFuncInterface[]) {
  return composeFilters(LogicalOperator.OR, conditions);
}
