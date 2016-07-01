import {Sorting, isSorting} from './SortingEnum';

export function reduceSorting(state = [], action = {}) {
  if (Array.isArray(state)) {
    state = state.map(sort => {
      if (isState(sort)) {
        let [key] = Object.keys(sort);
        if (isSorting(sort[key])) {
          return {[key]: sort[key]};
        }
      }
      throw new Error('Expected each sorting item to be a mapping of a single field name to a sorting direction');
    });
    return state;
  }
}

export function toComparator(sorting) {
  return (left, right) => {
    for (let sort of sorting) {
      let [key] = Object.keys(sort),
          answer = 0;
      if (sort[key] === Sorting.ASCENDING) {
        answer = 1;
      }
      if (sort[key] === Sorting.DESCENDING) {
        answer = -1;
      }
      if (left[key] < right[key]) {
        return -answer;
      }
      if (left[key] > right[key]) {
        return answer;
      }
    }
    return 0;
  };
}
