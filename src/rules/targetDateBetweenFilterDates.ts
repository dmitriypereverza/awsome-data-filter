import moment, { Moment } from "moment";

import {
  fieldFilterBuilder,
  FieldFilterBuilderInterface,
  FilterFuncInterface,
} from "../";

export const targetDateBetweenFilterDates = ({
  firstOperand,
  secondOperand,
}: Omit<FieldFilterBuilderInterface, "callback">): FilterFuncInterface => {
  return fieldFilterBuilder({
    firstOperand: firstOperand,
    secondOperand: secondOperand,
    callback: (
      filter: {
        valueFrom: Moment;
        valueTo: Moment;
      },
      currentDate: Moment,
    ) => {
      if (!filter.valueFrom && !filter.valueTo) {
        return undefined;
      }
      const fromFilterDate = filter.valueFrom
        ? moment(filter.valueFrom, "DD.MM.YYYY")
        : null;
      const toFilterDate = filter.valueTo
        ? moment(filter.valueTo, "DD.MM.YYYY")
        : null;
      return (
        (!fromFilterDate ||
          currentDate.isSameOrAfter(fromFilterDate, "date")) &&
        (!toFilterDate || currentDate.isSameOrBefore(toFilterDate, "date"))
      );
    },
  });
};
