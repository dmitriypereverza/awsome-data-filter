import moment, { Moment } from "moment";

import {
  constValue,
  elementField,
  filterField,
  ValueGetterInterface,
} from "..";

import { or } from "../conditions";

import { equalProps } from "../rules/equalProps";
import { isEmptyArray } from "../rules/isEmptyArray";
import { equalOneOf } from "../rules/equalOneOf";
import { someInArray } from "../rules/someInArray";
import { not } from "../rules/not";
import { betweenDates } from "../rules/betweenDates";
import { lessThen } from "../rules/lessThen";
import { moreThen } from "../rules/moreThen";

test("Equal props test", () => {
  const element1 = {
    serviceGroup: {
      code: "one",
    },
  };
  const element2 = {
    serviceGroup: {
      code: "two",
    },
  };
  const element3 = {
    serviceGroup: {
      code: null,
    },
  };
  const element4 = {
    serviceGroup: {
      code: undefined,
    },
  };
  const element5 = {
    serviceGroup: {},
  };
  const element6 = {};

  const filter = {
    serviceGroup: {
      code: "one",
    },
  };

  const func = equalProps(
    filterField("serviceGroup.code"),
    elementField("serviceGroup.code"),
  );

  expect(func(filter, element1)).toEqual(true);
  expect(func(filter, element2)).toEqual(false);
  expect(func(filter, element3)).toEqual(false);
  expect(func(filter, element4)).toEqual(false);
  expect(func(filter, element5)).toEqual(false);
  expect(func(filter, element6)).toEqual(false);
});

test("isFieldsEqual", () => {
  const match = equalOneOf(elementField("value"), [
    constValue(null),
    constValue(""),
  ]);

  expect(match({}, { value: null })).toEqual(true);
  expect(match({}, { value: undefined })).toEqual(false);
  expect(match({}, { value: "" })).toEqual(true);
  expect(match({}, { value: "null" })).toEqual(false);
  expect(match({}, { value: 0 })).toEqual(false);
  expect(match({}, {})).toEqual(false);
  expect(match({}, NaN)).toEqual(false);
  expect(match({}, null)).toEqual(false);
  expect(match({}, undefined)).toEqual(false);
});

test("isEmptyArrayField", () => {
  const match = isEmptyArray(elementField("value"));

  expect(match({}, { value: [1] })).toEqual(false);
  expect(match({}, { value: [] })).toEqual(true);
  expect(match({}, {})).toEqual(undefined);
  expect(match({}, null)).toEqual(undefined);
  expect(match({}, undefined)).toEqual(undefined);
  expect(match({}, "fff")).toEqual(undefined);
});

test("both isFieldsEqual and isEmptyArrayField", () => {
  const match = or([
    equalOneOf(elementField("value"), [constValue(null), constValue("")]),
    isEmptyArray(elementField("value")),
  ]);

  expect(match({}, { value: [1] })).toEqual(false);
  expect(match({}, { value: [] })).toEqual(true);
  expect(match({}, {})).toEqual(false);
  expect(match({}, null)).toEqual(false);
  expect(match({}, undefined)).toEqual(false);
  expect(match({}, "fff")).toEqual(false);
});

test("Some Match In Array test", () => {
  const element1 = {
    attributes: [
      {
        name: "attribute1",
      },
      {
        name: "attribute2",
      },
    ],
  };
  const element2 = {
    attributes: [],
  };
  const element3 = {
    attributes: null,
  };
  const element4 = {};
  const element5 = null;

  const filter = {
    attribute: {
      name: "attribute1",
    },
  };

  const softMatch = or([
    equalOneOf(elementField("attributes"), [constValue(null), constValue("")]),
    isEmptyArray(elementField("attributes")),
    someInArray(
      elementField("attributes"),
      equalProps(filterField("attribute.name"), elementField("name")),
    ),
  ]);

  const hardMatch = someInArray(
    elementField("attributes"),
    equalProps(filterField("attribute.name"), elementField("name")),
  );

  expect(softMatch(filter, element1)).toEqual(true);
  expect(hardMatch(filter, element1)).toEqual(true);

  expect(softMatch(filter, element2)).toEqual(true);
  expect(hardMatch(filter, element2)).toEqual(undefined);

  expect(softMatch(filter, element3)).toEqual(true);
  expect(hardMatch(filter, element3)).toEqual(undefined);

  expect(softMatch(filter, element4)).toEqual(false);
  expect(hardMatch(filter, element4)).toEqual(undefined);

  expect(softMatch(filter, element5)).toEqual(false);
  expect(hardMatch(filter, element5)).toEqual(undefined);
});

test("not rule test", () => {
  const match = equalProps(constValue(1), constValue(1));

  expect(match({}, {})).toEqual(true);
  expect(not(match)({}, {})).toEqual(false);
});

test("betweenDates rule test", () => {
  function toMomentDeco(
    func: ValueGetterInterface<string>,
    format: string,
  ): ValueGetterInterface<Moment> {
    return (...args) => moment(func(...args), format);
  }

  const match = betweenDates(
    toMomentDeco(constValue("12.12.2020"), "DD.MM.YYYY"),
    [
      toMomentDeco(constValue("10.12.2020"), "DD.MM.YYYY"),
      toMomentDeco(constValue("13.12.2020"), "DD.MM.YYYY"),
    ],
  );

  const matchFail = betweenDates(
    toMomentDeco(constValue("1.12.2020"), "DD.MM.YYYY"),
    [
      toMomentDeco(constValue("10.12.2020"), "DD.MM.YYYY"),
      toMomentDeco(constValue("13.12.2020"), "DD.MM.YYYY"),
    ],
  );

  const matchNotValid = betweenDates(
    toMomentDeco(constValue("1.sdfsdf.2020"), "DD.MM.YYYY"),
    [
      toMomentDeco(constValue("10.12.2020"), "DD.MM.YYYY"),
      toMomentDeco(constValue("13.12.2020"), "DD.MM.YYYY"),
    ],
  );

  expect(match({}, {})).toEqual(true);
  expect(matchFail({}, {})).toEqual(false);
  expect(matchNotValid({}, {})).toEqual(undefined);
});

test("less and more then rule", () => {
  const match = lessThen(constValue(10), constValue(20));
  const matchFail = lessThen(constValue(100), constValue(20));
  const matchFail2 = lessThen(constValue("101"), constValue(20));

  expect(match({}, {})).toEqual(true);
  expect(matchFail({}, {})).toEqual(false);
  expect(matchFail2({}, {})).toEqual(false);

  const match2 = moreThen(constValue(10), constValue(20));
  const match2Fail = moreThen(constValue(100), constValue(20));
  const match2Fail2 = moreThen(constValue("101"), constValue(20));

  expect(match2({}, {})).toEqual(false);
  expect(match2Fail({}, {})).toEqual(true);
  expect(match2Fail2({}, {})).toEqual(true);
});
