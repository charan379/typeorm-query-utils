export { default as parseCondition } from './parse-condition';
export { default as applySortOrderQB } from './qb-apply-sort-order';
export { default as applyWhereConditionsQB } from './qb-apply-where-conditions';
export { default as applyWhereConditionQB } from './qb-apply-where-condition';
export { default as applyFiltersQB } from './qb-apply-filters';


// Define the type for FindOperatorQB
export interface FindOperatorQB {
    query: string;
    parameters?: any;
}

/**
 * Type representing possible sort order values.
 */
export type SortOrder = 'ascend' | 'descend' | 'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1;
