import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import parseCondition from './parse-condition';

/**1
 * Applies a condition to a TypeORM Query Builder.
 *
 * @param {SelectQueryBuilder<T>} qb - The TypeORM Query Builder instance.
 * @param {string} alias - The alias used in the query.
 * @param {string} field - The field name.
 * @param {any} condition - The condition value.
 * @param {'andWhere' | 'orWhere'} whereMethod - The method to use for applying the condition.
 */
function applyWhereConditionQB<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, alias: string, field: string, condition: any, whereMethod: 'andWhere' | 'orWhere' = 'andWhere'): void {
  const { query, parameters } = parseCondition({ conditionFor: "qb", fieldAlias: `${alias}.${field}`, condition });
  qb[whereMethod](query, parameters);
}
export default applyWhereConditionQB;