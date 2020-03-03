import { buildFilter, constValue, elementField, filterField } from "../index";

import { matchText } from "../rules/matchText";
import { and } from "../conditions";
import { equalProp } from "../rules/equalProp";

const originalDataList = [
  {
    groupName: "Название группы",
    list: [
      { name: "Фио1", count: "1111" },
      { name: "Фио2", count: "222" },
      { name: "Фио3", count: "333" },
    ],
  },
  {
    groupName: "Название группы2",
    list: [
      { name: "Фио12", count: "11112" },
      { name: "Фио22", count: "222" },
      { name: "Фио32", count: "33322" },
    ],
  },
  {
    groupName: "Первая группа",
    list: [
      { name: "Тест88", count: "8" },
      { name: "Ф66", count: "95" },
    ],
  },
  {
    groupName: "Вторая группа",
    list: [{ name: "Тест8", count: "77" }],
  },
  {
    groupName: "первая часть",
    list: [{ name: "Тест7", count: "88" }],
  },
];


const testMap = {
  filterText1: [
    {
      groupName: "Название группы",
      list: [{ name: "Фио2", count: "222" }],
    },
    {
      groupName: "Название группы2",
      list: [
        { name: "Фио12", count: "11112" },
        { name: "Фио22", count: "222" },
        { name: "Фио32", count: "33322" },
      ],
    },
  ],
  filterDropdown: [
    {
      groupName: "Название группы",
      list: [{ name: "Фио2", count: "222" }],
    },
    {
      groupName: "Название группы2",
      list: [{ name: "Фио22", count: "222" }],
    },
  ],
  filterDropdownAndSearchText: [
    {
      groupName: "Название группы2",
      list: [{ name: "Фио22", count: "222" }],
    },
  ],
  filterDropdownAndSearchText2: [],
};

test("Filter simple test", () => {
  const builtFilterFunction = buildFilter({
    ruleConfig: {
      elementFilterFunc: and([
        matchText(filterField("name"), elementField("name")),
        matchText(constValue("моя"), elementField("name")),
      ]),
    },
  });

  const { elements } = builtFilterFunction(
    { name: "груп" },
    {
      groups: [],
      elements: [
        { name: "гру" },
        { name: "груп" },
        { name: "группа" },
        { name: "моя группа" },
      ],
    },
  );
  expect(elements).toStrictEqual([{ name: "моя группа" }]);
});

test("Filter by searchText", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setGroupsFunc: (group, items) => ({ ...group, list: items }),
      setChildrenFunc: (group, items) => ({ ...group, list: items }),
      getChildrenFunc: group => group.list,
      getGroupsFunc: () => [],
    },
    ruleConfig: {
      elementFilterFunc: and([
        matchText(filterField("name"), elementField("name")),
      ]),
    },
  });

  const { groups } = buildedFilterFunction(
    { name: "2" },
    {
      groups: [...originalDataList],
      elements: [],
    },
  );

  expect(groups).toStrictEqual(testMap.filterText1);
});

test("Filter by dropdown", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setGroupsFunc: (group, items) => ({ ...group, list: items }),
      setChildrenFunc: (group, items) => ({ ...group, list: items }),
      getChildrenFunc: group => group.list,
      getGroupsFunc: () => [],
    },
    ruleConfig: {
      elementFilterFunc: and([
        equalProp(filterField("amount"), elementField("count")),
      ]),
    },
  });

  const { groups } = buildedFilterFunction(
    { amount: "222" },
    {
      groups: [...originalDataList],
      elements: [],
    },
  );

  expect(groups).toStrictEqual(testMap.filterDropdown);
});

test("Filter by dropdown and searchText", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setGroupsFunc: (group, items) => ({ ...group, list: items }),
      setChildrenFunc: (group, items) => ({ ...group, list: items }),
      getChildrenFunc: group => group.list,
      getGroupsFunc: () => [],
    },
    ruleConfig: {
      elementFilterFunc: and([
        equalProp(filterField("amount"), elementField("count")),
        matchText(filterField("name"), elementField("name")),
      ]),
    },
  });

  const { groups } = buildedFilterFunction(
    { name: "Фио22", amount: "222" },
    {
      groups: [...originalDataList],
      elements: [],
    },
  );

  expect(groups).toStrictEqual(testMap.filterDropdownAndSearchText);
});

test("Filter by group", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setGroupsFunc: (group, items) => ({ ...group, list: items }),
      setChildrenFunc: (group, items) => ({ ...group, list: items }),
      getChildrenFunc: group => group.list,
      getGroupsFunc: () => [],
    },
    ruleConfig: {
      groupFilterFunc: and([
        matchText(filterField("name"), elementField("groupName")),
      ]),
    },
  });

  const { groups } = buildedFilterFunction(
    { name: "первая" },
    {
      groups: [...originalDataList],
      elements: [],
    },
  );
  expect(groups).toStrictEqual([
    {
      groupName: "Первая группа",
      list: [
        { name: "Тест88", count: "8" },
        { name: "Ф66", count: "95" },
      ],
    },
    {
      groupName: "первая часть",
      list: [{ name: "Тест7", count: "88" }],
    },
  ]);
});

test("Filter by group without filter", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setGroupsFunc: (group, items) => ({ ...group, list: items }),
      setChildrenFunc: (group, items) => ({ ...group, list: items }),
      getChildrenFunc: group => group.list,
      getGroupsFunc: () => [],
    },
    ruleConfig: {
      groupFilterFunc: matchText(
        filterField("name"),
        elementField("groupName"),
      ),
    },
  });

  const { groups } = buildedFilterFunction(
    {},
    {
      groups: [...originalDataList],
      elements: [],
    },
  );
  expect(groups).toStrictEqual(originalDataList);
});

test("Filter by group with elements filter", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setGroupsFunc: (group, items) => ({ ...group, list: items }),
      setChildrenFunc: (group, items) => ({ ...group, list: items }),
      getChildrenFunc: group => group.list,
      getGroupsFunc: () => [],
    },
    ruleConfig: {
      elementFilterFunc: matchText(
        filterField("elementName"),
        elementField("name"),
      ),
      groupFilterFunc: matchText(
        filterField("groupName"),
        elementField("groupName"),
      ),
    },
  });

  const { groups } = buildedFilterFunction(
    {
      groupName: "первая",
      elementName: "Тест8",
    },
    {
      groups: [...originalDataList],
      elements: [],
    },
  );

  expect(groups).toStrictEqual([
    {
      groupName: "Первая группа",
      list: [{ name: "Тест88", count: "8" }],
    },
    {
      groupName: "Вторая группа",
      list: [{ name: "Тест8", count: "77" }],
    },
    {
      groupName: "первая часть",
      list: [{ name: "Тест7", count: "88" }],
    },
  ]);
});

interface ElementInterface {
  name: string;
  count: string;
}
interface DeepGroupsInterface {
  groupName: string;
  elements?: ElementInterface[];
  groups?: DeepGroupsInterface[];
}

const originalDeepDataList: DeepGroupsInterface[] = [
  {
    groupName: "Название группы",
    elements: [{ name: "Фио1", count: "1111" }],
  },
  {
    groupName: "Название группы2",
    groups: [
      {
        groupName: "test",
        elements: [
          { name: "Фио12", count: "11112" },
          { name: "Фио22", count: "222" },
        ],
      },
      {
        groupName: "test4",
        elements: [
          { name: "Фио124", count: "111124" },
          { name: "Фио224", count: "2224" },
        ],
      },
    ],
  },
  {
    groupName: "Название группы2",
    groups: [
      {
        groupName: "Группа второго уровня",
        elements: [
          { name: "Фио12", count: "11112" },
          { name: "Фио22", count: "222" },
        ],
        groups: [
          {
            groupName: "Группа третьего уровня",
            elements: [
              { name: "Фио12", count: "11112" },
              { name: "Фио22", count: "000" },
            ],
          },
        ],
      },
    ],
  },
];

test("Filter DeepDataList with elements filter", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setChildrenFunc: (group, items) => ({ ...group, elements: items }),
      setGroupsFunc: (group, groups) => ({ ...group, groups: groups }),
      getChildrenFunc: group => group.elements,
      getGroupsFunc: group => group.groups,
    },
    ruleConfig: {
      elementFilterFunc: equalProp(
        filterField("amount"),
        elementField("count"),
      ),
      groupFilterFunc: equalProp(
        filterField("groupName"),
        elementField("groupName"),
      ),
    },
  });

  const { groups } = buildedFilterFunction(
    {
      amount: "000",
    },
    {
      groups: [...originalDeepDataList],
      elements: [],
    },
  );

  expect(groups).toStrictEqual([
    {
      groupName: "Название группы2",
      groups: [
        {
          groupName: "Группа второго уровня",
          elements: [],
          groups: [
            {
              groupName: "Группа третьего уровня",
              elements: [{ name: "Фио22", count: "000" }],
            },
          ],
        },
      ],
    },
  ]);
});

test("Filter DeepDataList without filter", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      setChildrenFunc: (group, items) => ({ ...group, elements: items }),
      setGroupsFunc: (group, groups) => ({ ...group, groups: groups }),
      getChildrenFunc: group => group.elements,
      getGroupsFunc: group => group.groups,
    },
    ruleConfig: {
      groupFilterFunc: matchText(
        filterField("groupName"),
        elementField("groupName"),
      ),
    },
  });

  const { groups } = buildedFilterFunction(
    {},
    {
      groups: [...originalDeepDataList],
      elements: [],
    },
  );

  expect(groups).toStrictEqual(originalDeepDataList);
});

test("Filter DeepDataList with all group filter", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      getChildrenFunc: group => group.elements,
      setChildrenFunc: (group, elements) => ({ ...group, elements }),
      getGroupsFunc: group => group.groups,
      setGroupsFunc: (group, groups) => ({ ...group, groups }),
    },
    ruleConfig: {
      groupFilterFunc: matchText(
        filterField("groupName"),
        elementField("groupName"),
      ),
    },
  });

  const { groups } = buildedFilterFunction(
    { groupName: "груп" },
    {
      groups: [...originalDeepDataList],
      elements: [],
    },
  );

  expect(groups).toStrictEqual(originalDeepDataList);
});

const originalElements: ElementInterface[] = [
  { name: "Фио9", count: "1" },
  { name: "Фио8", count: "12" },
  { name: "Фио7", count: "123" },
  { name: "Фио77", count: "1234" },
  { name: "Фио5", count: "12345" },
];

test("Filter elements by only elements filter", () => {
  const buildedFilterFunction = buildFilter({
    ruleConfig: {
      elementFilterFunc: matchText(
        filterField("elementName"),
        elementField("name"),
      ),
    },
  });

  const { groups, elements } = buildedFilterFunction(
    { elementName: "Фио7" },
    {
      groups: [],
      elements: [...originalElements],
    },
  );

  expect(groups).toStrictEqual([]);
  expect(elements).toStrictEqual([
    { name: "Фио7", count: "123" },
    { name: "Фио77", count: "1234" },
  ]);
});

test("Filter elements by elements and group filter", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      getChildrenFunc: group => group.elements,
      setChildrenFunc: (group, elements) => ({ ...group, elements }),
      getGroupsFunc: group => group.groups,
      setGroupsFunc: (group, groups) => ({ ...group, groups }),
    },
    ruleConfig: {
      elementFilterFunc: matchText(
        filterField("elementName"),
        elementField("name"),
      ),
      groupFilterFunc: matchText(
        filterField("groupName"),
        elementField("groupName"),
      ),
    },
  });

  const { groups, elements } = buildedFilterFunction(
    {
      elementName: "Фио",
      groupName: "группы",
    },
    {
      groups: [],
      elements: [...originalElements],
    },
  );

  expect(groups).toStrictEqual([]);
  expect(elements).toStrictEqual([]);
});

const groupsData = [
  {
    groupName: "Название группы",
    list: [
      {
        name: "Фио1",
        count: "1111",
      },
      {
        name: "Фио2",
        count: "222",
      },
    ],
  },
  {
    groupName: "Название группы2",
    list: [
      {
        name: "Фио12",
        count: "11112",
      },
      {
        name: "Фио32",
        count: "33322",
      },
    ],
  },
];

test("Filter groups with undefined rule result value", () => {
  const buildedFilterFunction = buildFilter({
    traversalConfig: {
      getChildrenFunc: group => group.list,
      setChildrenFunc: (group, list) => ({ ...group, list }),
      getGroupsFunc: group => group.groups,
      setGroupsFunc: (group, groups) => ({ ...group, groups }),
    },
    ruleConfig: {
      elementFilterFunc: and([
        equalProp(filterField("amount"), elementField("count")),
        matchText(filterField("name"), elementField("name")),
      ]),
      groupFilterFunc: matchText(filterField("name"), elementField("name")),
    },
  });

  const { groups } = buildedFilterFunction(
    {
      name: "фио1",
    },
    {
      groups: groupsData,
      elements: [],
    },
  );

  expect(groups).toStrictEqual([
    {
      groupName: "Название группы",
      list: [
        {
          name: "Фио1",
          count: "1111",
        },
      ],
    },
    {
      groupName: "Название группы2",
      list: [
        {
          name: "Фио12",
          count: "11112",
        },
      ],
    },
  ]);
});
