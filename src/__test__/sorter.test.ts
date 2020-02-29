import {
  getTraversalHandler,
  getObjectsSort,
  Order,
  SortTypes,
} from "../sorter";

const originalDataList = [
  { name: "abcd", count: "1111" },
  { name: "Abcd", count: "222" },
  { name: "AAA", count: "222" },
  { name: "Bb", count: "333" },
  { name: "fg", count: "11112" },
  { name: "C", count: "222" },
  { name: "Z", count: "33322" },
  { name: "Z111", count: "33322" },
  { name: "111", count: "000000" },
  { name: "222", count: "2" },
];

test("Filter by number", () => {
  const res = getObjectsSort({
    code: "count",
    order: Order.ASC,
    type: SortTypes.NUMBER,
  })(originalDataList);

  expect(res).toStrictEqual([
    { name: "111", count: "000000" },
    { name: "222", count: "2" },
    { name: "Abcd", count: "222" },
    { name: "AAA", count: "222" },
    { name: "C", count: "222" },
    { name: "Bb", count: "333" },
    { name: "abcd", count: "1111" },
    { name: "fg", count: "11112" },
    { name: "Z", count: "33322" },
    { name: "Z111", count: "33322" },
  ]);
});

test("Filter by number desc", () => {
  const res = getObjectsSort({
    code: "count",
    order: Order.DESC,
    type: SortTypes.NUMBER,
  })(originalDataList);

  expect(res).toStrictEqual([
    { name: "Z", count: "33322" },
    { name: "Z111", count: "33322" },
    { name: "fg", count: "11112" },
    { name: "abcd", count: "1111" },
    { name: "Bb", count: "333" },
    { name: "Abcd", count: "222" },
    { name: "AAA", count: "222" },
    { name: "C", count: "222" },
    { name: "222", count: "2" },
    { name: "111", count: "000000" },
  ]);
});

test("Filter by strings", () => {
  const res = getObjectsSort({
    code: "name",
    order: Order.ASC,
    type: SortTypes.STRING,
  })(originalDataList);

  expect(res).toStrictEqual([
    { name: "111", count: "000000" },
    { name: "222", count: "2" },
    { name: "AAA", count: "222" },
    { name: "abcd", count: "1111" },
    { name: "Abcd", count: "222" },
    { name: "Bb", count: "333" },
    { name: "C", count: "222" },
    { name: "fg", count: "11112" },
    { name: "Z", count: "33322" },
    { name: "Z111", count: "33322" },
  ]);
});

const deepSortObject = [
  {
    name: "test1",
    list: [
      { name: "aa", count: "1" },
      { name: "AArr", count: "2" },
    ],
    groups: [
      {
        name: "test1.1",
        list: [
          { name: "fg", count: "11112" },
          { name: "Z", count: "33322" },
        ],
      },
      {
        name: "BTest1.2",
        list: [
          { name: "Z", count: "1" },
          { name: "zzz", count: "0000000" },
        ],
      },
    ],
  },
  {
    name: "ATest",
    list: [
      { name: "ff", count: "26" },
      { name: "bb", count: "11" },
    ],
  },
];

const traversalHandler = getTraversalHandler({
  getChildrenFunc: group => group.list,
  setChildrenFunc: (group, list) => ({ ...group, list }),
  getGroupsFunc: group => group.groups,
  setGroupsFunc: (group, groups) => ({ ...group, groups }),
});

test("Deep sort elements", () => {
  const res = traversalHandler(
    {
      elementsHandler: getObjectsSort({
        code: "count",
        order: Order.ASC,
        type: SortTypes.NUMBER,
      }),
    },
    deepSortObject,
  );

  expect(res).toStrictEqual([
    {
      name: "test1",
      list: [
        { name: "aa", count: "1" },
        { name: "AArr", count: "2" },
      ],
      groups: [
        {
          name: "test1.1",
          list: [
            { name: "fg", count: "11112" },
            { name: "Z", count: "33322" },
          ],
        },
        {
          name: "BTest1.2",
          list: [
            { name: "zzz", count: "0000000" },
            { name: "Z", count: "1" },
          ],
        },
      ],
    },
    {
      name: "ATest",
      list: [
        { name: "bb", count: "11" },
        { name: "ff", count: "26" },
      ],
    },
  ]);
});

test("Filter by date", () => {
  const res = getObjectsSort({
    code: "date",
    order: Order.ASC,
    type: SortTypes.DATE,
  })([
    { name: "111", date: "12.12.2019" },
    { name: "111", date: "11.12.2019" },
    { name: "111", date: "12.12.2000" },
  ]);

  expect(res).toStrictEqual([
    { name: "111", date: "12.12.2000" },
    { name: "111", date: "11.12.2019" },
    { name: "111", date: "12.12.2019" },
  ]);
});
