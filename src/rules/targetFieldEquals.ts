import { FilterFuncInterface } from "../";

const emptyObj = {};

export const targetFieldEquals = ({
  targetField,
  values,
}: {
  targetField: string;
  values: any[];
}): FilterFuncInterface =>
  function(_, data: any) {
    if (!data) return undefined;
    const splitedFieldsPath = targetField.split(".");

    let targetValue = data;
    for (let i = 0; i < splitedFieldsPath.length; i++) {
      const key = splitedFieldsPath[i];
      if (!targetValue.hasOwnProperty(key)) {
        targetValue = emptyObj;
        break;
      }
      targetValue = targetValue[key];
    }

    if (targetValue === emptyObj) {
      return undefined;
    }

    return values.includes(targetValue);
  };
