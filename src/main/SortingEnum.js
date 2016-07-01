/**
 * @typedef {"asc"|"desc"}
 * Sorting direction.
 */
export const Sorting = {
  ASCENDING: 'asc',
  DESCENDING: 'desc'
};

Sorting.values = [Sorting.ASCENDING, Sorting.DESCENDING];

export function isSorting(sorting) {
  return Sorting.values.indexOf(sorting) > -1;
}
