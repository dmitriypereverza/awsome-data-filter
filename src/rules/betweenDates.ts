import { Moment } from "moment";

import { FilterFuncInterface, ValueGetterInterface } from "../";

export const betweenDates = (
  targetDate: ValueGetterInterface<Moment>,
  filterDates: [ValueGetterInterface<Moment>, ValueGetterInterface<Moment>],
): FilterFuncInterface =>
  function(filter, element) {
    const currentDateValue = targetDate({ filter, element });
    const filterDatesValue = filterDates.map(el => el({ filter, element }));

    if (!currentDateValue.isValid() || filterDatesValue.some(el => !el.isValid())) {
      return undefined;
    }
    const fromFilterDate = filterDatesValue[0];
    const toFilterDate = filterDatesValue[1];

    return (
      (!fromFilterDate ||
        currentDateValue.isSameOrAfter(fromFilterDate, "date")) &&
      (!toFilterDate || currentDateValue.isSameOrBefore(toFilterDate, "date"))
    );
  };
