import { Brackets, WhereExpressionBuilder } from "typeorm";
import parseCondition from "./parse-condition";

/**
 * Recursively applies filter conditions to a QueryBuilder's `where` clause.
 *
 * This utility function dynamically processes a given set of filter conditions and applies them
 * to the QueryBuilder instance. It supports `$and` and `$or` logical operators for nested conditions
 * and utilizes `parseCondition` for processing atomic conditions.
 *
 * @param qb - The TypeORM QueryBuilder's `WhereExpressionBuilder` instance to which conditions will be applied.
 * @param whereMethod - The method to use for combining conditions (`andWhere` or `orWhere`).
 * @param conditions - The filter conditions to apply. Supports logical operators (`$and`, `$or`) and field conditions.
 * @param alias - The table alias to be prefixed to the field names in the query.
 *
 * @throws FlierlyException - Throws an exception if there's an error parsing a condition.
 *
 * Example usage:
 * ```typescript
 * const qb = repository.createQueryBuilder('entity');
 * applyWhereConditionsQb(qb, 'andWhere', { name: 'John', $or: [{ age: 30 }, { age: 40 }] }, 'entity');
 * ```
 */
const applyWhereConditionsQB = (
    qb: WhereExpressionBuilder,
    whereMethod: 'andWhere' | 'orWhere',
    conditions: any,
    alias: string
) => {
    for (const field in conditions) {
        if (Object.prototype.hasOwnProperty.call(conditions, field)) {
            const condition = conditions[field];

            try {
                if (field === '$and' || field === '$or') {
                    qb[whereMethod](
                        new Brackets((nestedQb) => {
                            condition.forEach((nestedCondition: any) => {
                                applyWhereConditionsQB(
                                    nestedQb,
                                    field === '$and' ? 'andWhere' : 'orWhere',
                                    nestedCondition,
                                    alias
                                );
                            });
                        })
                    );
                } else {
                    // Handle related entity fields dynamically
                    let fieldAlias = `${alias}.${field}`;
                    if (field.includes('.')) {
                        const [relation, relatedField] = field.split('.');
                        fieldAlias = `${relation}.${relatedField}`;
                    }

                    const { query, parameters } = parseCondition({
                        conditionFor: 'qb',
                        fieldAlias, // Dynamically handle nested aliases
                        condition,
                    });

                    qb[whereMethod](query, parameters);
                }
            } catch (error) {
                const errorInc = new Error();
                errorInc.message = `Error parsing condition for field "${field}": ${(error as Error).message}`;
                errorInc.name = "TypeORM_QUERY_CONDITION_PARSING_ERROR"
                errorInc.stack = JSON.stringify(error)
                throw errorInc;
            }
        }
    }
};

export default applyWhereConditionsQB;