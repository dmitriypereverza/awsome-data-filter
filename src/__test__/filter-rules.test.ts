import { equalProps } from "../rules/equalProps";
import { targetFieldEquals } from "../rules/targetFieldEquals";
import { isEmptyArrayField } from "../rules/targetFieldIsEmptyArray";
import { composeFilters, LogicalOperator } from "..";
import { someMatchInArray } from "../rules/someMatchInArray";

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

  const func = equalProps({
    filterField: "serviceGroup.code",
    targetField: "serviceGroup.code",
  });

  expect(func(filter, element1)).toEqual(true);
  expect(func(filter, element2)).toEqual(false);
  expect(func(filter, element3)).toEqual(false);
  expect(func(filter, element4)).toEqual(false);
  expect(func(filter, element5)).toEqual(false);
  expect(func(filter, element6)).toEqual(false);
});

test("isFieldsEqual", () => {
  const match = targetFieldEquals({
    targetField: "value",
    values: [undefined, null, ""],
  });

  expect(match({}, { value: null })).toEqual(true);
  expect(match({}, { value: undefined })).toEqual(true);
  expect(match({}, { value: "" })).toEqual(true);
  expect(match({}, { value: "null" })).toEqual(false);
  expect(match({}, { value: 0 })).toEqual(false);
  expect(match({}, {})).toEqual(undefined);
  expect(match({}, NaN)).toEqual(undefined);
  expect(match({}, null)).toEqual(undefined);
  expect(match({}, undefined)).toEqual(undefined);
});

test("isEmptyArrayField", () => {
  const match = isEmptyArrayField({
    targetField: "value",
  });

  expect(match({}, { value: [1] })).toEqual(false);
  expect(match({}, { value: [] })).toEqual(true);
  expect(match({}, {})).toEqual(undefined);
  expect(match({}, null)).toEqual(undefined);
  expect(match({}, undefined)).toEqual(undefined);
  expect(match({}, "fff")).toEqual(undefined);
});

test("both isFieldsEqual and isEmptyArrayField", () => {
  const match = composeFilters(LogicalOperator.OR, [
    targetFieldEquals({
      targetField: "value",
      values: [undefined, null, ""],
    }),
    isEmptyArrayField({
      targetField: "value",
    }),
  ]);

  expect(match({}, { value: [1] })).toEqual(false);
  expect(match({}, { value: [] })).toEqual(true);
  expect(match({}, {})).toEqual(undefined);
  expect(match({}, null)).toEqual(undefined);
  expect(match({}, undefined)).toEqual(undefined);
  expect(match({}, "fff")).toEqual(undefined);
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

  const softMatch = composeFilters(LogicalOperator.OR, [
    targetFieldEquals({
      targetField: "attributes",
      values: [undefined, null, ""],
    }),
    isEmptyArrayField({
      targetField: "attributes",
    }),
    someMatchInArray({
      targetField: "attributes",
      condition: composeFilters(LogicalOperator.OR, [
        equalProps({
          filterField: "attribute.name",
          targetField: "name",
        }),
      ]),
    }),
  ]);

  const hardMatch = someMatchInArray({
    targetField: "attributes",
    condition: composeFilters(LogicalOperator.OR, [
      equalProps({
        filterField: "attribute.name",
        targetField: "name",
      }),
    ]),
  });

  expect(softMatch(filter, element1)).toEqual(true);
  expect(hardMatch(filter, element1)).toEqual(true);

  expect(softMatch(filter, element2)).toEqual(true);
  expect(hardMatch(filter, element2)).toEqual(undefined);

  expect(softMatch(filter, element3)).toEqual(true);
  expect(hardMatch(filter, element3)).toEqual(undefined);

  expect(softMatch(filter, element4)).toEqual(undefined);
  expect(hardMatch(filter, element4)).toEqual(undefined);

  expect(softMatch(filter, element5)).toEqual(undefined);
  expect(hardMatch(filter, element5)).toEqual(undefined);
});
