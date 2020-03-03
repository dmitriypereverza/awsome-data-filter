import { StrategiesFilterInterfaceInterface } from "../index";

const standardStrategy: StrategiesFilterInterfaceInterface = {
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
};

export default standardStrategy;
