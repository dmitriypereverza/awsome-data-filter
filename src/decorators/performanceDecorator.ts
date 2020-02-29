import { splitEvery } from "ramda";

import { FilterFunctionInterface } from "../index";

import { performanceReduce } from "../tools/performanceReduce";

export function filterPerformanceDecorator(
  func: FilterFunctionInterface,
  elementChunkCount = 100,
  groupChunkCount = 2,
): (
  filter: Parameters<FilterFunctionInterface>[0],
  data: Parameters<FilterFunctionInterface>[1],
) => Promise<ReturnType<FilterFunctionInterface>> {
  return (filter, data) => {
    return new Promise((resolve, reject) => {
      try {
        const elementsChunks = splitEvery(
          elementChunkCount,
          data.elements || [],
        );
        const groupsChunks = splitEvery(groupChunkCount, data.groups || []);

        Promise.all([
          performanceReduce(
            elementsChunks,
            (acc, elementsChunk) => {
              const { elements } = func(filter, {
                elements: elementsChunk,
                groups: [],
              });
              acc = acc.concat(elements);
              return acc;
            },
            [],
          ),
          performanceReduce(
            groupsChunks,
            (acc, groupChunk) => {
              const { groups } = func(filter, {
                elements: [],
                groups: groupChunk,
              });
              acc = acc.concat(groups);
              return acc;
            },
            [],
          ),
        ]).then(data => {
          resolve({
            elements: data[0],
            groups: data[1],
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  };
}
