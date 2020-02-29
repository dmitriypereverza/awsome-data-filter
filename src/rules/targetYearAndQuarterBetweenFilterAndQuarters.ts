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
  filterField,
  targetField,
}: Omit<FieldFilterBuilderInterface, "callback">): FilterFuncInterface => {
  return fieldFilterBuilder({
    filterField,
    targetField,
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
