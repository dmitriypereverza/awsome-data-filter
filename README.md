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
