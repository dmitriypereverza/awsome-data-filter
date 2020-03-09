import { path } from "ramda";
import standardStrategy from "./strategies/standardStrategy";

export interface FilterFuncInterface {
  (filterValue: any, targetValue: any, _valueWhenRuleInvalid?: boolean):
    | boolean
    | undefined;
}

export interface ValueGetterInterface<T> {
  (data: { filter?: any; element?: any }): T;
}

interface FilterFuncCarriedWithFilterInterface {
  (source: any, valueWhenNotFilter?: boolean): boolean | undefined;
}

export interface FieldFilterBuilderInterface {
  firstOperand: ValueGetterInterface<any>;
  secondOperand: ValueGetterInterface<any>;
  callback: FilterFuncInterface;
}

export enum LogicalOperator {
  AND,
  OR,
}

interface ToolsInterface
  extends Pick<
    TraversalConfigInterface,
    "getChildrenFunc" | "setChildrenFunc" | "setGroupsFunc" | "getGroupsFunc"
  > {
  isGroupFilterIsActive: boolean;
  applyElementFilter: FilterFuncCarriedWithFilterInterface;
  applyGroupFilter: FilterFuncCarriedWithFilterInterface;
  getIsGroupFilterHaveMatch: (data) => boolean;
}

interface FilterHandlerInterface {
  (params: { element: any; originalElement: any; tools: ToolsInterface }):
    | any
    | null;
}

export interface FilterFunctionInterface {
  <GROUP, ELEMENTS>(
    filter: any,
    data: { groups: GROUP[]; elements: ELEMENTS[] },
  ): {
    groups: GROUP[];
    elements: ELEMENTS[];
  };
}

export interface TraversalConfigInterface {
  getChildrenFunc: (group) => any[];
  setChildrenFunc: (group, elements: any[]) => any;
  setGroupsFunc: (group: any, groups: any[]) => any;
  getGroupsFunc: (group: any) => any[];
}

export interface RuleConfigInterface {
  elementFilter?: FilterFuncInterface;
  groupFilter?: FilterFuncInterface;
}

export interface StrategiesFilterInterfaceInterface {
  groupHandler: FilterHandlerInterface;
  elementHandler: FilterHandlerInterface;
}

export const fieldFilterBuilder = ({
  firstOperand,
  secondOperand,
  callback,
}: FieldFilterBuilderInterface): FilterFuncInterface => {
  return function(filter: any, data: any, _valueWhenNotFilter = undefined) {
    const firstOperandValue = firstOperand({ filter, element: data });
    const secondOperandValue = secondOperand({ filter, element: data });
    if (firstOperandValue === undefined || firstOperandValue === null) {
      return _valueWhenNotFilter;
    }
    return callback(firstOperandValue, secondOperandValue);
  };
};

export const filterField = <T>(fieldName: string): ValueGetterInterface<T> => {
  return ({ filter }) => path(fieldName.split("."), filter);
};
export const elementField = <T>(fieldName: string): ValueGetterInterface<T> => {
  return ({ element }) => path(fieldName.split("."), element);
};
export const constValue = <T>(value: T): ValueGetterInterface<T> => {
  return () => value;
};

export function buildFilter({
  filterStrategy = standardStrategy,
  traversal = {
    setChildrenFunc: group => group,
    setGroupsFunc: group => group,
    getChildrenFunc: () => [],
    getGroupsFunc: () => [],
  },
  rules,
}: {
  filterStrategy?: StrategiesFilterInterfaceInterface;
  traversal?: TraversalConfigInterface;
  rules: RuleConfigInterface;
}): FilterFunctionInterface {
  return (filter, data) => {
    const {
      getChildrenFunc,
      getGroupsFunc,
      setChildrenFunc,
      setGroupsFunc,
    } = traversal;

    const { elementFilter, groupFilter } = rules;

    const applyGroupFilter = (filter =>
      groupFilter
        ? (data, defaultValue = undefined) =>
            groupFilter(filter, data, defaultValue)
        : null)(filter);

    const applyElementFilter = (filter =>
      elementFilter
        ? (data, defaultValue = undefined) =>
            elementFilter(filter, data, defaultValue)
        : null)(filter);

    const isGroupFilterIsActive =
      applyGroupFilter && applyGroupFilter({}) !== undefined;

    const getIsGroupFilterHaveMatch = group =>
      applyGroupFilter ? !!applyGroupFilter(group) : false;

    const tools: ToolsInterface = {
      isGroupFilterIsActive,
      applyElementFilter,
      applyGroupFilter,
      getIsGroupFilterHaveMatch,
      getChildrenFunc,
      setChildrenFunc,
      setGroupsFunc,
      getGroupsFunc,
    };

    const groupMapper = (group, handler: FilterHandlerInterface) => {
      const groups = getGroupsFunc ? getGroupsFunc(group) : [];
      if (!groups || !groups.length) {
        return handler({ element: group, originalElement: group, tools });
      }

      const newGroups = groups
        .map(el => groupMapper(el, handler))
        .filter(Boolean);

      const newGroup = setGroupsFunc ? setGroupsFunc(group, newGroups) : group;
      return handler({ element: newGroup, originalElement: group, tools });
    };

    return {
      groups: data.groups
        .map(group => groupMapper(group, filterStrategy.groupHandler))
        .filter(Boolean),
      elements: data.elements
        .map(el =>
          filterStrategy.elementHandler({
            element: el,
            originalElement: el,
            tools,
          }),
        )
        .filter(Boolean),
    };
  };
}
