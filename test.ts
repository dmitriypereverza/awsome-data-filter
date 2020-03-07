const dataList = [
  {
    groupName: "first group",
    list: [
      { age: 31, name: "Marina" },
      { age: 23, name: "Fabio" },
    ],
  },
  {
    groupName: "second group",
    groups: [
      {
        groupName: "third group",
        list: [],
        groups: [
          {
            groupName: "fourth group",
            list: [{ age: 42, name: "Li" }],
          },
        ],
      },
    ],
    list: [
      { age: 41, name: "Marina" },
      { age: 29, name: "Inez" },
      { age: 33, name: "Marina" },
    ],
  },
  {
    groupName: "fifth group",
    list: [
      { age: 21, name: "Dmitriy" },
      { age: 22, name: "Li" },
      { age: 45, name: "Mitchell" },
    ],
  },
];
import { buildFilter, elementField, filterField } from "awsome-data-filter";
import { matchText } from "awsome-data-filter/rules";

const filter = buildFilter({
  traversalConfig: {
    getChildrenFunc: group => group.list, // как получить конечные элементы
    setChildrenFunc: (group, list) => ({ ...group, list }), // как записать конечные элементы в группу
    getGroupsFunc: group => group.groups, // как получить вложенные группы
    setGroupsFunc: (group, groups) => ({ ...group, groups }), // как записать вложенные группы
  },
  ruleConfig: {
    elementFilterFunc: matchText(
      filterField("searchText"),
      elementField("name"),
    ),
    groupFilterFunc: matchText(
      filterField("groupName"),
      elementField("groupName"),
    ),
  },
});

const filterValue = {
  searchText: "li",
  groupName: "fi",
};

const { groups } = filter(filterValue, {
  groups: dataList,
  elements: [],
});

console.log(groups);
// groups:
//[
//  {
//    groupName: "first group",
//    list: [
//      { age: 31, name: "Marina" },
//      { age: 23, name: "Fabio" },
//    ],
//  },
//  {
//    groupName: "second group",
//    groups: [
//      {
//        groupName: "third group",
//        list: [],
//        groups: [
//          {
//            groupName: "fourth group",
//            list: [{ age: 42, name: "Li" }],
//          },
//        ],
//      },
//    ],
//    list: [],
//  },
//  {
//    groupName: "fifth group",
//    list: [
//      { age: 22, name: "Li" },
//    ],
//  },
//]
