import { path, curry, splitEvery } from "ramda";

export interface FilterFuncInterface {
  (filterValue: any, targetValue: any, _valueWhenNotFilter?: boolean):
    | boolean
    | undefined;
}

interface FilterFuncCarriedWithFilterInterface {
  (source: any, valueWhenNotFilter?: boolean): boolean | undefined;
}

export interface FieldFilterBuilderInterface {
  filterField: string;
  targetField: string;
  callback: FilterFuncInterface;
}

export enum LogicalOperator {
  AND,
  OR,
}

export const fieldFilterBuilder = ({
  filterField,
  targetField,
  callback,
}: FieldFilterBuilderInterface): FilterFuncInterface => {
  return function(filter: any, data: any, _valueWhenNotFilter = undefined) {
    const filterValue = path(filterField.split("."), filter);
    const targetValue = path(targetField.split("."), data);
    if (filterValue === undefined || filterValue === null) {
      return _valueWhenNotFilter;
    }
    return callback(filterValue, targetValue);
  };
};

export const composeFilters = (
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

export const customFieldFilter = ({
  filterField,
  targetField,
  callback,
}: FieldFilterBuilderInterface): FilterFuncInterface => {
  return fieldFilterBuilder({
    filterField,
    targetField,
    callback,
  });
};

interface ToolsInterface
  extends Pick<
    BuildFilterInterface,
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

interface BuiltFilterFunction {
  <GROUP, ELEMENTS>(
    filter: any,
    data: { groups: GROUP[]; elements: ELEMENTS[] },
  ): {
    groups: GROUP[];
    elements: ELEMENTS[];
  };
}

interface BuildFilterInterface {
  getChildrenFunc: (group) => any[];
  setChildrenFunc: (group, elements: any[]) => any;
  setGroupsFunc: (group: any, groups: any[]) => any;
  getGroupsFunc: (group: any) => any[];
  elementFilterFunc?: FilterFuncInterface;
  groupFilterFunc?: FilterFuncInterface;
}

export const buildFilterToDataList = curry(
  (
    filterStrategy: {
      groupHandler: FilterHandlerInterface;
      elementHandler: FilterHandlerInterface;
    },
    traversalConfig: BuildFilterInterface,
  ): BuiltFilterFunction => {
    return (filter, data) => {
      const {
        getChildrenFunc,
        getGroupsFunc,
        setChildrenFunc,
        setGroupsFunc,
        elementFilterFunc,
        groupFilterFunc,
      } = traversalConfig;

      const groupFilterFuncWithFilter = (filter =>
        groupFilterFunc
          ? (data, defaultValue = undefined) =>
              groupFilterFunc(filter, data, defaultValue)
          : null)(filter);

      const elementFilterFuncWithFilter = (filter =>
        elementFilterFunc
          ? (data, defaultValue = undefined) =>
              elementFilterFunc(filter, data, defaultValue)
          : null)(filter);

      const isGroupFilterIsActive =
        groupFilterFuncWithFilter &&
        groupFilterFuncWithFilter({}) !== undefined;

      const getIsGroupFilterHaveMatch = group =>
        groupFilterFuncWithFilter ? !!groupFilterFuncWithFilter(group) : false;

      const tools: ToolsInterface = {
        isGroupFilterIsActive,
        applyElementFilter: elementFilterFuncWithFilter,
        applyGroupFilter: groupFilterFuncWithFilter,
        getIsGroupFilterHaveMatch,
        getChildrenFunc,
        setChildrenFunc,
        setGroupsFunc,
        getGroupsFunc,
      };

      const groupMapper = (group, handler: FilterHandlerInterface) => {
        const groups = getGroupsFunc(group);
        if (!groups || !groups.length) {
          return handler({ element: group, originalElement: group, tools });
        }

        const newGroups = groups
          .map(el => groupMapper(el, handler))
          .filter(Boolean);

        const newGroup = setGroupsFunc(group, newGroups);
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
  },
);

export function filterPerformanceDecorator(
  func: BuiltFilterFunction,
  elementChunkCount = 100,
  groupChunkCount = 2,
): (
  filter: Parameters<BuiltFilterFunction>[0],
  data: Parameters<BuiltFilterFunction>[1],
) => Promise<ReturnType<BuiltFilterFunction>> {
  return (filter, data) => {
    return new Promise((resolve, reject) => {
      try {
        const elementsChunks = splitEvery(
          elementChunkCount,
          data.elements || [],
        );
        const groupsChunks = splitEvery(groupChunkCount, data.groups || []);

        Promise.all([
          performanceReduce(
            elementsChunks,
            (acc, elementsChunk) => {
              const { elements } = func(filter, {
                elements: elementsChunk,
                groups: [],
              });
              acc = acc.concat(elements);
              return acc;
            },
            [],
          ),
          performanceReduce(
            groupsChunks,
            (acc, groupChunk) => {
              const { groups } = func(filter, {
                elements: [],
                groups: groupChunk,
              });
              acc = acc.concat(groups);
              return acc;
            },
            [],
          ),
        ]).then(data => {
          resolve({
            elements: data[0],
            groups: data[1],
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  };
}

export function performanceReduce<T, K>(
  list: T[],
  cb: (acc: K, data: T) => any,
  initialValue: K,
): Promise<K> {
  const array = [...list];
  let result: K = initialValue;

  function recursiveCalculate(done) {
    if (array.length === 0) {
      done(result);
      return;
    }

    setTimeout(() => {
      const elem = array.pop();
      result = cb(result, elem);
      recursiveCalculate(done);
    }, 0);
  }

  return new Promise<K>((resolve, reject) => {
    try {
      recursiveCalculate(resolve);
    } catch (e) {
      reject(e);
    }
  });
}
