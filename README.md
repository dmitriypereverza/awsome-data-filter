### Фильтрация таблицных данных 

Часто ли вам приходилось писать обработчики фильтрации для ваших таблиц? Правила могут повторяться, данные изменяться и чем больше контролов фильтра будет повляться, тем сложнее и неустойчивее будет код обработчика.

Данная библиотека, используя декларативный подход, позволяет составлять сложные правила обработки ваших данных.


## Установка

Сначала поставим библиотеку и опробуем ее в действии.

```text
npm install awesome-data-filter

или

yarn install awesome-data-filter
``` 
Начнем с простого примера.
Предположим у нас есть следующий массив пользователей.

```javascript
const users = [
  {
    age: 31,
    name: "Marina Gilmore",
  },
  {
    age: 34,
    name: "Joyner Mccray",
  },
  {
    age: 23,
    name: "Inez Copeland",
  },
  {
    age: 23,
    name: "Marina Mitchell",
  },
  {
    age: 25,
    name: "Prince Spears",
  },
];
```

И объект фильтра:

```javascript
const filterValue = {
  age: 23,
  searchText: "mari",
};
```

Предположим на нужно найти пересечение этих правил.

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
  matchText, 
  and,
  equalProp
} from "awsome-ui-filter";

const filter = buildFilter({
    ruleConfig: {
      elementFilterFunc: and([
        matchText(filterField("searchText"), elementField("name")),
        equalProp(filterField("age"), elementField("age")),
      ]),
    },
  });

const { elements } = filter(
    filterValue,
    {
      groups: [],
      elements: users,
    },
);

// elements: [{ age: 23, name: "Marina Mitchell" }]
```

Если же заменим `and` на `or` то получим объединение результатов работы 2х фильтров.

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
  matchText, 
  or,
  equalProp
} from "awsome-ui-filter";

const filter = buildFilter({
    ruleConfig: {
      elementFilterFunc: or([
        matchText(filterField("searchText"), elementField("name")),
        equalProp(filterField("age"), elementField("age")),
      ]),
    },
  });

const { elements } = filter(
    filterValue,
    {
      groups: [],
      elements: users,
    },
);

// elements: 
// [
//   {
//     age: 31,
//     name: "Marina Gilmore",
//   },
//   {
//     age: 23,
//     name: "Inez Copeland",
//   },
//   {
//     age: 23,
//     name: "Marina Mitchell",
//   }
// ]
```

Благодаря функциям `filterField`, `elementField` и `constValue` мы можем динамически передавать параметры в созданные правила.

Условия могут вкладываться друг в друга ``or(..., [and([..., ...]), or([..., ...])])``


Также фильтр может работать с вложенными элементами и группами. Рассмотрим на примере ниже:


```javascript
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
```

В таком случае можно передать в конфиг фильтра информацию об обходе данной структуры объекта `traversalConfig`: 

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
  matchText, 
} from "awsome-ui-filter";

const filter = buildFilter({
    traversalConfig: {
      getChildrenFunc: group => group.list, // как получить конечные элементы
      setChildrenFunc: (group, list) => ({ ...group, list }), // как записать конечные элементы в группу
      getGroupsFunc: group => group.groups, // как получить вложенные группы
      setGroupsFunc: (group, groups) => ({ ...group, groups }), // как записать вложенные группы
    },
    ruleConfig: {
      elementFilterFunc: matchText(filterField("searchText"), elementField("name")),
    },
  });

const filterValue = {
  searchText: "li",
};

const { elements } = filter(
    filterValue,
    {
      groups: dataList, // группы с вложенными элементами и группами
      elements: [], // как элементы можно передавать только плоские списки
    },
);

// elements: 
//[
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
```

До этого момента передавался только `elementFilterFunc` параметр, который отвечает за правила фильтрации 
 элементов. Также есть `groupFilterFunc` для групп.

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
  matchText, 
} from "awsome-ui-filter";

const filter = buildFilter({
    traversalConfig: {
      getChildrenFunc: group => group.list, // как получить конечные элементы
      setChildrenFunc: (group, list) => ({ ...group, list }), // как записать конечные элементы в группу
      getGroupsFunc: group => group.groups, // как получить вложенные группы
      setGroupsFunc: (group, groups) => ({ ...group, groups }), // как записать вложенные группы
    },
    ruleConfig: {
      elementFilterFunc: matchText(filterField("searchText"), elementField("name")),
      groupFilterFunc: matchText(filterField("groupName"), elementField("groupName")),
    },
  });

const filterValue = {
  searchText: "li",
  groupName: "fi",
};

const { elements } = filter(
    filterValue,
    {
      groups: dataList,
      elements: [],
    },
);

// elements: 
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
```

Группа с названием `first group` появилась в выборке и так фильтр не нашел совпадения по элементам, но нашел совпадение по группе то мы видим отображение всех вложенных элементов списка.
В случае с `fifth group`, совпадение было и по элементам и по группе, поэтому оставляем только один элемент.

Подобные зависимости фильтрации между группами и элементами называются `стратегией фильтрации`. По умолчанию указана следующая стратегия:

```javascript
const standardStrategy: StrategiesFilterInterfaceInterface = {
  elementHandler: ({ // стратегия на обработку конечных элементов
    element,
    tools: { 
        isGroupFilterIsActive, // есть ли фильтр по группам
        applyElementFilter // ф-ция фильтрации элемента
    },
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
    // если элементы есть фильтруем их
    if (children) {
      originalChildren = [...children];
      newChildren = originalChildren.filter(element =>
        applyElementFilter
          ? applyElementFilter(element, !isGroupFilterIsActive)
          : !isGroupFilterIsActive,
      );
    }
    // если совпадений по элементам неть но есть по группе возвражем исходный объект
    if (!newChildren.length && getIsGroupFilterHaveMatch(group)) {
      return originalGroup;
    }
    // если совпадения по элементам есть, записываем их в группу
    if (childrenExists) {
      group = setChildrenFunc(group, newChildren);
    }

    // проверка вложенных групп
    const newGroups = getGroupsFunc(group);
    const isGroupsExists = !!(newGroups && newGroups.length);
    const isElementExists = !!(newChildren && newChildren.length);
    return isElementExists || isGroupsExists ? group : null;
  },
};
```

Если стандартная стратегия не подходит для вашего случая, можно написать свою и передать ее в поле фильтра `filterStrategy`.

Для более детального понимания работы библиотеки можно просмотреть написанные тесты `src/__test__`.






