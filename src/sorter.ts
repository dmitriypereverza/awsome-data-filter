import { path, sort } from "ramda";
import moment from "moment";

export interface CustomSortingFunctionInterface {
  (a: any, b: any): 1 | -1 | 0;
}

export enum Order {
  ASC,
  DESC,
}

export enum SortTypes {
  NUMBER = "number",
  STRING = "string",
  DATE = "date",
  CUSTOM = "custom",
}

interface SortConfigInterface {
  code: string;
  order: Order;
  type?: SortTypes;
  customSortingFunction?: CustomSortingFunctionInterface;
}

const getUnixTime = (date: string | number, format: string) => {
  return moment(date, format)
    .toDate()
    .getTime();
};

const getPropByCodeFunc = code => obj => path(code.split("."), obj);

interface SortFuncInterface {
  (a: any, b: any): -1 | 1 | 0;
}

type SortMapInterface = {
  [key in SortTypes]: null | SortFuncInterface;
};

const getSortValueForDate = value =>
  moment.isMoment(value)
    ? value.isValid()
      ? value.unix()
      : 0
    : getUnixTime(value, "DD.MM.YYYY HH:mm");

const sortMap: SortMapInterface = {
  [SortTypes.NUMBER]: (a, b) => {
    a = Number(a);
    b = Number(b);
    return a < b ? -1 : a > b ? 1 : 0;
  },
  [SortTypes.STRING]: (a, b) => {
    a = a.toString().toLowerCase();
    b = b.toString().toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  },
  [SortTypes.DATE]: (a, b) => {
    a = getSortValueForDate(a);
    b = getSortValueForDate(b);
    return a < b ? -1 : a > b ? 1 : 0;
  },
  [SortTypes.CUSTOM]: null,
};

export const getObjectsSort = <T>({
  code,
  order,
  type,
  customSortingFunction,
}: SortConfigInterface): ((elements: T[]) => T[]) => {
  type = type || SortTypes.STRING;
  return elements => {
    const sortFunc =
      type === SortTypes.CUSTOM ? customSortingFunction : sortMap[type];

    const getProp = getPropByCodeFunc(code);

    return sort((el1, el2) => {
      if ([el1, el2].includes(undefined)) return 0;
      const prop1 = getProp(el1);
      const prop2 = getProp(el2);
      if ([prop1, prop2].includes(undefined)) return 0;
      const sortResult = sortFunc(prop1, prop2);
      return order === Order.ASC ? sortResult : sortResult * -1;
    }, elements);
  };
};

interface TraversalInterface {
  getChildrenFunc: (group) => any[];
  setChildrenFunc: (group, elements: any[]) => any;
  setGroupsFunc: (group: any, groups: any[]) => any;
  getGroupsFunc: (group: any) => any[];
}

interface TraversalFuncInterface {
  (traversalConfig: TraversalInterface): <GROUP, ELEMENT>(
    handlers: {
      elementsHandler?: (list: ELEMENT[]) => ELEMENT[];
      groupsHandler?: (list: GROUP[]) => GROUP[];
    },
    elements: (GROUP | ELEMENT)[],
  ) => (GROUP | ELEMENT)[];
}

export const getTraversalHandler: TraversalFuncInterface = ({
  getChildrenFunc,
  setChildrenFunc,
  getGroupsFunc,
  setGroupsFunc,
}) => {
  return ({ elementsHandler, groupsHandler }, list) => {
    const traversalList = group => {
      let newGroups = getGroupsFunc(group);
      if (newGroups && newGroups.length) {
        newGroups = newGroups.map(traversalList);
        group = setGroupsFunc(group, newGroups);
      }
      if (groupsHandler) {
        group = setGroupsFunc(group, groupsHandler(newGroups));
      }
      if (!elementsHandler) {
        return group;
      }
      const elements = getChildrenFunc(group);
      if (elements && elements.length) {
        group = setChildrenFunc(group, elementsHandler(elements));
      }
      return group;
    };
    const results = list.map(traversalList);
    return groupsHandler ? groupsHandler(results) : results;
  };
};

export function customSortingFunctionByFirstElementInArray(
  fieldInArraysName: string,
) {
  return function(prevElement, currentElement) {
    if (!prevElement || prevElement.length === 0) return 1;
    if (!currentElement || currentElement.length === 0) return -1;
    return prevElement[0][fieldInArraysName].toLowerCase() >
      currentElement[0][fieldInArraysName].toLowerCase()
      ? 1
      : -1;
  };
}
