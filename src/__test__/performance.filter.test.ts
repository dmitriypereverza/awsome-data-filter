import {
  buildFilterToDataList,
  composeFilters,
  filterPerformanceDecorator,
  LogicalOperator,
  performanceReduce,
} from "../index";
import { equalProps } from "../rules/equalProps";

const buildFilter = buildFilterToDataList({
  elementHandler: ({
    element,
    tools: { isGroupFilterIsActive, applyElementFilter },
  }) => {
    if (isGroupFilterIsActive) return null;
    if (!applyElementFilter) return element;
    return applyElementFilter(element, true) ? element : null;
  },
  groupHandler: ({
    element: group,
    originalElement: originalGroup,
    tools: {
      isGroupFilterIsActive,
      applyElementFilter,
      getIsGroupFilterHaveMatch,
      getGroupsFunc,
      getChildrenFunc,
      setChildrenFunc,
    },
  }) => {
    let newChildren = [];
    let originalChildren = [];
    const children = getChildrenFunc(group);
    const childrenExists = !!children;
    if (children) {
      originalChildren = [...children];
      newChildren = originalChildren.filter(element =>
        applyElementFilter
          ? applyElementFilter(element, !isGroupFilterIsActive)
          : !isGroupFilterIsActive,
      );
    }
    if (!newChildren.length && getIsGroupFilterHaveMatch(group)) {
      return originalGroup;
    }
    if (childrenExists) {
      group = setChildrenFunc(group, newChildren);
    }
    const newGroups = getGroupsFunc(group);
    const isGroupsExists = !!(newGroups && newGroups.length);
    const isElementExists = !!(newChildren && newChildren.length);
    return isElementExists || isGroupsExists ? group : null;
  },
});

test("Test sequence of rules of filters", () => {
  const builtFilterFunction = buildFilter({
    getChildrenFunc: () => [],
    setChildrenFunc: () => {},
    getGroupsFunc: () => [],
    setGroupsFunc: () => {},
    elementFilterFunc: composeFilters(LogicalOperator.OR, [
      equalProps({
        filterField: "val",
        targetField: "val",
      }),
      equalProps({
        filterField: "val2",
        targetField: "val2",
      }),
    ]),
  });

  const { elements } = builtFilterFunction(
    {
      val: 1,
      val2: 2,
    },
    {
      groups: [],
      elements: [
        { val: 1, val2: 2 },
        { val: 1, val2: 2 },
        { val: 1, val2: 2 },
        { val: 2, val2: 1 },
        { val: 3, val2: 1 },
        { val: 2, val2: 1 },
      ],
    },
  );

  expect(elements).toStrictEqual([
    { val: 1, val2: 2 },
    { val: 1, val2: 2 },
    { val: 1, val2: 2 },
  ]);
});

test("Test performance filter decorator", done => {
  const buildedFilterFunction = buildFilter({
    getChildrenFunc: () => [],
    setChildrenFunc: () => {},
    getGroupsFunc: () => [],
    setGroupsFunc: () => {},
    elementFilterFunc: composeFilters(LogicalOperator.OR, [
      equalProps({
        filterField: "val",
        targetField: "val",
      }),
      equalProps({
        filterField: "val2",
        targetField: "val2",
      }),
    ]),
  });
  const decoratedFilterFunc = filterPerformanceDecorator(buildedFilterFunction);

  decoratedFilterFunc(
    {
      val: 1,
      val2: 2,
    },
    {
      groups: [],
      elements: [
        { val: 1, val2: 2 },
        { val: 1, val2: 2 },
        { val: 1, val2: 2 },
        { val: 2, val2: 1 },
        { val: 3, val2: 1 },
        { val: 2, val2: 1 },
      ],
    },
  ).then(data => {
    expect(data.elements).toStrictEqual([
      { val: 1, val2: 2 },
      { val: 1, val2: 2 },
      { val: 1, val2: 2 },
    ]);
    done();
  }, done);
});

test("Test performanceReduce", done => {
  performanceReduce(
    [1, 2, 3],
    (acc, data) => {
      acc += data;
      return acc;
    },
    0,
  ).then(data => {
    expect(data).toEqual(6);
    done();
  }, done);
});
