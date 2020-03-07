import * as index from "../src";
import * as sorter from "../src/sorter";

import { or, and } from "../src/conditions";

import { betweenDates } from "../src/rules/betweenDates";
import { equalOneOf } from "../src/rules/equalOneOf";
import { equalProp } from "../src/rules/equalProp";
import { isEmptyArray } from "../src/rules/isEmptyArray";
import { lessThen } from "../src/rules/lessThen";
import { matchText } from "../src/rules/matchText";
import { moreThen } from "../src/rules/moreThen";
import { not } from "../src/rules/not";
import { someInArray } from "../src/rules/someInArray";
import { targetNumberBetweenFilterNumbers } from "../src/rules/targetNumberBetweenFilterNumbers";

export default {
  ...index,
  ...sorter,
  or,
  and,
  betweenDates,
  equalOneOf,
  equalProp,
  isEmptyArray,
  lessThen,
  matchText,
  moreThen,
  not,
  someInArray,
  targetNumberBetweenFilterNumbers,
};
