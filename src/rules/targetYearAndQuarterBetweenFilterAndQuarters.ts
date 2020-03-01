import moment, { Moment } from "moment";

import {
  fieldFilterBuilder,
  FieldFilterBuilderInterface,
  FilterFuncInterface,
} from "../";

interface PeriodYearAndQuarterInterface {
  year: string | number;
  quarter: string | number;
}

export const targetYearAndQuarterBetweenFilterAndQuarters = ({
  firstOperand,
  secondOperand,
}: Omit<FieldFilterBuilderInterface, "callback">): FilterFuncInterface => {
  return fieldFilterBuilder({
    firstOperand: firstOperand,
    secondOperand: secondOperand,
    callback: periodFilterForYearAndQuarter,
  });
};

const getMomentDate = (value: PeriodYearAndQuarterInterface) =>
  value ? moment(`${value.year} ${value.quarter}`, "YYYY Q") : null;

const periodFilterForYearAndQuarter = (
  filter: {
    valueFrom: PeriodYearAndQuarterInterface;
    valueTo: PeriodYearAndQuarterInterface;
  },
  currentDate: Moment,
) => {
  if (!filter.valueFrom && !filter.valueTo) {
    return undefined;
  }
  const fromFilterDate = getMomentDate(filter.valueFrom);
  const toFilterDate = getMomentDate(filter.valueTo);
  return (
    (!fromFilterDate || currentDate.isSameOrAfter(fromFilterDate, "quarter")) &&
    (!toFilterDate || currentDate.isSameOrBefore(toFilterDate, "quarter"))
  );
};
