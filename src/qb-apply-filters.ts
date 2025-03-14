import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import applyWhereConditionQB from './qb-apply-where-condition';

/**
 * Applies filters to a TypeORM Query Builder.
 *
 * @param {SelectQueryBuilder<T>} queryBuilder - The TypeORM Query Builder instance.
 * @param {string} alias - The alias used in the query.
 * @param {any} filter - The filter object.
 */
function applyFiltersQB<T extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<T>, alias: string, filter: any): void {
    Object.keys(filter).forEach((field) => {
        const value = filter[field];

        // Apply standard conditions
        applyWhereConditionQB(queryBuilder, alias, field, value, 'andWhere');
    });
}

export default applyFiltersQB;
