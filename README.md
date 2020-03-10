[![Build Status](https://travis-ci.org/dmitriypereverza/awsome-data-filter.svg?branch=master)](https://travis-ci.org/dmitriypereverza/awsome-data-filter)

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

И объект со значениями фильтра:

```javascript
const filterValue = {
  age: 23,
  searchText: "mari",
};
```

Предположим на нужно найти пересечение этих правил.

Используемые правила:
 - `matchText` - поиск подстроки в целевом поле.
 - `equalProp` - Полное совпадение значений параметров.
- `betweenDates` - проверяет вхождение определенной даты в диапазон
- `equalOneOf` - хотя бы один из переданных элементов должен соответствовать переданному правилу
- `someInArray` - хотя бы один из вложенных элементов объекта должен соответствовать переданному правилу
- `isEmptyArray` - проверка на пустой массив
- `lessThen` - значение меньше чем
- `moreThen` - значение больше чем
- `not` - функция отрицания возвращаемого ф-цией значения

В наших примерах мы будем использовать только `matchText` и `equalProp`.

Для получения динамических значений:
 - `filterField` - получение свойства фильтра
 - `elementField` - получение свойства текущего элемента списка

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
} from "awsome-data-filter";
import { matchText, equalProp } from "awsome-data-filter/rules";
import { and } from "awsome-data-filter/conditions";

const filter = buildFilter({
    rules: {
      elementFilter: and([
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

console.log(elements);
// elements: [{ age: 23, name: "Marina Mitchell" }]
```

Полученная ф-ция `filter` принимает объект со значениями фильтра, и фильтруемые данные в формате `groups` и `elements`.

Так как группы обрабатываются отдельно от элементов они вынесены в отдельное поле. Внутри групп также могут находиться элементы.

![](https://habrastorage.org/webt/ff/0h/d1/ff0hd1m-m9wk2gmemzlfg_qjdem.png)

В данном случае, так как у нас плоский список элементов, передаем только `elements`.

Если же заменим `and` на `or` то получим объединение результатов работы 2х правил.

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
} from "awsome-data-filter";
import { matchText, equalProp } from "awsome-data-filter/rules";
import { or } from "awsome-data-filter/conditions";

const filter = buildFilter({
    rules: {
      elementFilter: or([
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

console.log(elements);
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

Благодаря функциям `filterField`, `elementField` мы можем динамически передавать параметры в созданные правила.

Так же есть ф-ция `constValue` для передачи константных значений.
Условия могут вкладываться друг в друга ``or(..., matchText, [and([..., matchText, ...]), or([..., ...])])``

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

В таком случае можно передать в конфиг фильтра информацию об обходе данной структуры объекта в поле `traversal`: 

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
} from "awsome-data-filter";
import { matchText } from "awsome-data-filter/rules";

const filter = buildFilter({
    traversal: {
      getChildrenFunc: group => group.list, // как получить конечные элементы
      setChildrenFunc: (group, list) => ({ ...group, list }), // как записать конечные элементы в группу
      getGroupsFunc: group => group.groups, // как получить вложенные группы
      setGroupsFunc: (group, groups) => ({ ...group, groups }), // как записать вложенные группы
    },
    rules: {
      elementFilter: matchText(filterField("searchText"), elementField("name")),
    },
  });

const filterValue = {
  searchText: "li",
};

const { groups } = filter(filterValue, {
  groups: dataList, // группы с вложенными элементами и группами
  elements: [], // как элементы можно передавать только плоские списки
});

console.log(groups);
// groups: 
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

До этого момента передавался только `elementFilter` параметр, который отвечает за правила фильтрации элементов. Также есть `groupFilter` для групп.

```javascript
import { 
  buildFilter, 
  elementField, 
  filterField, 
} from "awsome-data-filter";
import { matchText } from "awsome-data-filter/rules";

const filter = buildFilter({
    traversal: {
      getChildrenFunc: group => group.list, // как получить конечные элементы
      setChildrenFunc: (group, list) => ({ ...group, list }), // как записать конечные элементы в группу
      getGroupsFunc: group => group.groups, // как получить вложенные группы
      setGroupsFunc: (group, groups) => ({ ...group, groups }), // как записать вложенные группы
    },
    rules: {
      elementFilter: matchText(filterField("searchText"), elementField("name")),
      groupFilter: matchText(filterField("groupName"), elementField("groupName")),
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
    // если совпадений по элементам нет, но есть по группе возвращаем исходный объект
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
    // если нет вложенных элементов и групп, то удаляем группу
    return isElementExists || isGroupsExists ? group : null;
  },
};
```

Если стандартная стратегия не подходит для вашего случая, можно написать свою и передать ее в поле фильтра `filterStrategy`.

Для более детального понимания работы библиотеки можно просмотреть написанные тесты `src/__test__`.






