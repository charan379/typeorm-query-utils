import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Applies sorting to a TypeORM Query Builder.
 *
 * @param {SelectQueryBuilder<T>} queryBuilder - The TypeORM Query Builder instance.
 * @param {Record<string, SortOrder>} sort - An object where keys are field names and values are sort orders.
 *   - Values can be: 'ascend', 'descend', 'asc', 'desc', 'ascending', 'descending', 1, or -1.
 * @returns {SelectQueryBuilder<T>} - The updated Query Builder with applied sorting.
 */
function applySortOrderQB<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>, 
    sort: Record<string, SortOrder>
): SelectQueryBuilder<T> {
    Object.entries(sort).forEach(([key, value]) => {
        // Determine the sort order
        const order = value === 'ascend' || value === 'asc' || value === 'ascending' || value === 1 ? 'ASC' : 'DESC';

        // Dynamically handle nested fields
        let fieldAlias = `${queryBuilder.alias}.${key}`;
        if (key.includes('.')) {
            const [relation, relatedField] = key.split('.');
            fieldAlias = `${relation}.${relatedField}`;
        }

        // Apply the sort order to the query builder
        queryBuilder.addOrderBy(fieldAlias, order);
    });

    return queryBuilder;
}

export default applySortOrderQB;