import { Between, Equal, FindOperator, ILike, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Raw } from 'typeorm';
import { v4 as uuid } from 'uuid'

// Centralized operator map
const operatorMap: Record<string, string> = {
    $in: 'IN',
    $notIn: 'NOT IN',
    $gte: '>=',
    $lte: '<=',
    $gt: '>',
    $lt: '<',
    $between: 'BETWEEN',
    $notBetween: 'NOT BETWEEN',
    $contains: 'LIKE',
    $notContains: 'NOT LIKE',
    $iContains: 'ILIKE',
    $notIContains: 'NOT ILIKE',
    $startsWith: 'LIKE',
    $notStartsWith: 'NOT LIKE',
    $endsWith: 'LIKE',
    $notEndsWith: 'NOT LIKE',
    $regex: '~',
    $notRegex: '!~',
    $regexi: '~*',
    $notRegexi: '!~*',
    $equalTo: '=',
    $notEqualTo: '<>',
    $jsonContains: '@>',
    $jsonContained: '<@',
    $jsonEquals: '=',
    $jsonHasKey: '?',
};

// Function overloads for parseCondition

/**
 * Parses condition for TypeORM query builder ('qb') type. 
 * @param params - Object with parameters for the condition.
 * @param params.conditionFor - Specifies the type of condition ('qb').
 * @param params.fieldAlias - Optional alias for the field.
 * @param params.condition - The condition to apply in the query.
 * @returns {FindOperatorQB} - The parsed condition object for use in query builder.
 */
function parseCondition(params: { conditionFor: "qb", fieldAlias: string; condition: any; }): FindOperatorQB;

/**
 * Parses condition for TypeORM 'find' operator type.
 * @param params - Object with parameters for the condition.
 * @param params.conditionFor - Specifies the type of condition ('find').
 * @param params.condition - The condition to apply in the query.
 * @returns {FindOperator<any>} - The parsed condition object for use in find operation.
 */
function parseCondition(params: { conditionFor: "find", condition: any; fieldAlias: string; }): FindOperator<any>;

/**
 * Parses conditions into a TypeORM-compatible format.
 * Uses Raw for complex conditions and supports both 'qb' and 'find' types.
 * 
 * @param params - Object with the following properties:
 *   - `fieldAlias`: Optional alias for the field (used only for 'qb' conditions).
 *   - `condition`: The condition to apply in the query.
 *   - `conditionFor`: Specifies the type of condition, either 'qb' or 'find'.
 * @returns {any} - A parsed condition, either in the form of a `FindOperatorQB` or `FindOperator<any>`.
 * @throws Error if an unsupported `conditionFor` value is provided.
 */
function parseCondition({ fieldAlias: a, condition, conditionFor }: { fieldAlias: string; condition: any; conditionFor: "qb" | "find" }): any {

    if (conditionFor !== 'qb' && conditionFor !== 'find') {
        // Throw an error if an unsupported `conditionFor` value is passed
        throw new Error("UNSUPPORTED_CONDITION_FOR_VALUE");
    }

    // Generate a unique prefix for parameter aliases
    const uniqueId = uuid().replace(/-/g, '_');

    // Basic validation: Check if alias is a non-empty string
    if ((typeof a !== 'string' || a.trim().length === 0) && conditionFor === 'qb') {
        throw new Error('ALIAS_MUST_BE_A_NON_EMPTY_STRING');
    }

    // Validate condition is not undefined or null
    if (condition === undefined || condition === null) {
        throw new Error('CONDITION_CANNOT_BE_UNDEFINED_OR_NULL');
    }

    // If the condition is an object, then it must have exactly one key
    if (typeof condition === 'object' && !Array.isArray(condition)) {

        // Check if the condition object has exactly one key, if not throw an error
        // This is to ensure that the condition object is a valid condition
        // e.g. { $in: [1, 2, 3] }
        // if no keys are found, then the object is not a valid condition
        if (Object.keys(condition).length !== 1) {
            throw new Error('CONDITION_OBJECT_MUST_HAVE_EXACTLY_ONE_KEY');
        }

        // Get the key and value of the condition object
        const [conditionOperator, conditionValue] = Object.entries(condition)[0];

        // Check if the condition operator is a valid string
        if (typeof conditionOperator !== 'string') {
            throw new Error('CONDITION_OPERATOR_MUST_BE_A_STRING');
        }

        // Check if the condition value is valid for the given operator
        if (conditionValue === undefined || conditionValue === null) {
            throw new Error("CONDITION_VALUE_CANNOT_BE_UNDEFINED_OR_NULL");
        }

        // Get the parameter prefix for parameter aliases along opreator 
        const pp = `${uniqueId}_${conditionOperator.replace(/\$/, "")}`;

        // Check if the condition operator is a valid operator
        switch (conditionOperator) {
            // If the condition operator is a valid operator, then return the parsed condition object
            case '$in':
                // Check if the condition value is an array of strings or numbers or dates
                if (Array.isArray(conditionValue) && conditionValue.every(item => typeof item === 'string' || typeof item === 'number' || item instanceof Date)) {
                    return (conditionFor === "qb")
                        ?
                        // Return a FindOperatorQB object for the 'qb' condition
                        { query: `${a} IN (:...${pp}_${a})`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        :
                        // Return a Raw object for the 'find' condition
                        In(conditionValue);

                } else {
                    throw new Error("$IN_OPERATOR_MUST_HAVE_AN_ARRAY_OF_STRINGS_OR_NUMBERS");
                }
            case '$notIn':
                // Check if the condition value is an array of strings or numbers or dates
                if (Array.isArray(conditionValue) && conditionValue.every(item => typeof item === 'string' || typeof item === 'number' || item instanceof Date)) {
                    return (conditionFor === "qb")
                        ?
                        // Return a FindOperatorQB object for the 'qb' condition
                        { query: `${a} NOT IN (:...${pp}_${a})`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        :
                        // Return a Raw object for the 'find' condition
                        Not(In(conditionValue))
                } else {
                    throw new Error("$IN_OPERATOR_MUST_HAVE_AN_ARRAY_OF_STRINGS_OR_NUMBERS");
                }
            case '$gte':
                // Check if the condition value is a number, string, or Date
                if (['number', 'string'].includes(typeof conditionValue) || conditionValue instanceof Date) {
                    return (conditionFor === "qb")
                        ?
                        // Return a FindOperatorQB object for the 'qb' condition
                        { query: `${a} >= :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        :
                        // Return a Raw object for the 'find' condition
                        MoreThanOrEqual(conditionValue);
                } else {
                    throw new Error("$GTE_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
                }
            case '$lte':
                // Check if the condition value is a number, string, or Date
                if (['number', 'string'].includes(typeof conditionValue) || conditionValue instanceof Date) {
                    return (conditionFor === "qb")
                        ?
                        // Return a FindOperatorQB object for the 'qb' condition
                        { query: `${a} <= :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        :
                        // Return a Raw object for the 'find' condition
                        LessThanOrEqual(conditionValue);
                } else {
                    throw new Error("$LTE_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
                }
            case '$gt':
                // Check if the condition value is a number, string or Date
                if (['number', 'string'].includes(typeof conditionValue) || conditionValue instanceof Date) {
                    return (conditionFor === "qb")
                        ?
                        // Return a FindOperatorQB object for the 'qb' condition
                        { query: `${a} > :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        :
                        // Return a Raw object for the 'find' condition
                        MoreThan(conditionValue);
                } else {
                    throw new Error("$GT_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
                }
            case '$lt':
                // Check if the condition value is a number, string or Date
                if (['number', 'string'].includes(typeof conditionValue) || conditionValue instanceof Date) {
                    return (conditionFor === "qb")
                        // Return a FindOperatorQB object for the 'qb' condition
                        ? { query: `${a} < :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        // Return a Raw object for the 'find' condition
                        : LessThan(conditionValue);
                } else {
                    throw new Error("$LT_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
                }
            case '$between':
                // Check if the condition value is an array with two values, each being a string, number, or Date
                if (Array.isArray(conditionValue) && conditionValue.length === 2 && conditionValue.every(item => typeof item === 'string' || typeof item === 'number' || item instanceof Date)) {
                    return (conditionFor === "qb")
                        ? { query: `${a} BETWEEN :${pp}_${a}_start AND :${pp}_${a}_end`, parameters: { [`${pp}_${a}_start`]: conditionValue[0], [`${pp}_${a}_end`]: conditionValue[1] } }
                        : Between(conditionValue[0], conditionValue[1]);
                } else {
                    throw new Error("$BETWEEN_OPERATOR_MUST_HAVE_AN_ARRAY_WITH_TWO_VALUES");
                }
            case '$notBetween':
                // Check if the condition value is an array with two values, each being a string, number, or Date
                if (Array.isArray(conditionValue) && conditionValue.length === 2 && conditionValue.every(item => typeof item === 'string' || typeof item === 'number' || item instanceof Date)) {
                    return (conditionFor === "qb")
                        ? { query: `${a} NOT BETWEEN :${pp}_${a}_start AND :${pp}_${a}_end`, parameters: { [`${pp}_${a}_start`]: conditionValue[0], [`${pp}_${a}_end`]: conditionValue[1] } }
                        : Not(Between(conditionValue[0], conditionValue[1]));
                } else {
                    throw new Error("$NOT_BETWEEN_OPERATOR_MUST_HAVE_AN_ARRAY_WITH_TWO_VALUES");
                }
            case '$contains':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} LIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `%${conditionValue}%` } }
                        : Like(`%${conditionValue}%`);
                } else {
                    throw new Error('$CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$notContains':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} NOT LIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `%${conditionValue}%` } }
                        : Not(Like(`%${conditionValue}%`));
                } else {
                    throw new Error('$NOT_CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$iContains':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} ILIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `%${conditionValue}%` } }
                        : ILike(`%${conditionValue}%`);
                } else {
                    throw new Error('$I_CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$notIContains':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} NOT ILIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `%${conditionValue}%` } }
                        : Not(ILike(`%${conditionValue}%`));
                } else {
                    throw new Error('$NOT_I_CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$startsWith':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} LIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `${conditionValue}%` } }
                        : Like(`${conditionValue}%`);
                } else {
                    throw new Error('$STARTS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$notStartsWith':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} NOT LIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `${conditionValue}%` } }
                        : Not(Like(`${conditionValue}%`));
                } else {
                    throw new Error('$NOT_STARTS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$endsWith':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} LIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `%${conditionValue}` } }
                        : Like(`%${conditionValue}`);
                } else {
                    throw new Error('$ENDS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$notEndsWith':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    return (conditionFor === "qb")
                        ? { query: `${a} NOT LIKE :${pp}_${a}`, parameters: { [`${pp}_${a}`]: `%${conditionValue}` } }
                        : Not(Like(`%${conditionValue}`));
                } else {
                    throw new Error('$NOT_ENDS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE');
                }
            case '$equalTo':
                // Check if the condition value is a string, number, boolean, or Date
                if ((typeof conditionValue === 'string' || typeof conditionValue === 'number' || typeof conditionValue === 'boolean' || conditionValue instanceof Date)) {
                    return (conditionFor === "qb")
                        ? { query: `${a} = :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        : Equal(conditionValue);
                } else {
                    throw new Error("$EQUAL_TO_OPERATOR_MUST_HAVE_A_STRING_NUMBER_BOOLEAN_OR_DATE_VALUE");
                }
            case '$notEqualTo':
                // Check if the condition value is a string, number, boolean, or Date
                if ((typeof conditionValue === 'string' || typeof conditionValue === 'number' || typeof conditionValue === 'boolean' || conditionValue instanceof Date)) {
                    return (conditionFor === "qb")
                        ? { query: `${a} != :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } }
                        : Not(Equal(conditionValue));
                } else {
                    throw new Error("$NOT_EQUAL_TO_OPERATOR_MUST_HAVE_A_STRING_NUMBER_BOOLEAN_OR_DATE_VALUE");
                }
            case '$regex':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    if (conditionFor === "qb") {
                        // Return a FindOperatorQB object for the 'qb' condition
                        return { query: `${a} ~ :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } };
                    } else {
                        // Return a Raw object for the 'find' condition
                        return Raw((alias: string) => `${alias} ~ :${pp}_${a}`, { [`${pp}_${a}`]: conditionValue });
                    }
                } else {
                    throw new Error("$REGEX_OPERATOR_MUST_HAVE_A_STRING_VALUE");
                }
            case '$notRegex':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    if (conditionFor === "qb") {
                        // Return a FindOperatorQB object for the 'qb' condition
                        return { query: `${a} !~ :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } };
                    } else {
                        // Return a Raw object for the 'find' condition
                        return Raw((alias: string) => `${alias} !~ :${pp}_${a}`, { [`${pp}_${a}`]: conditionValue });
                    }
                } else {
                    throw new Error("$NOT_REGEX_OPERATOR_MUST_HAVE_A_STRING_VALUE");
                }
            case '$regexi':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    if (conditionFor === "qb") {
                        // Return a FindOperatorQB object for the 'qb' condition
                        return { query: `${a} ~* :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } };
                    } else {
                        // Return a Raw object for the 'find' condition
                        return Raw((alias: string) => `${alias} ~* :${pp}_${a}`, { [`${pp}_${a}`]: conditionValue });
                    }
                } else {
                    throw new Error("$REGEXI_OPERATOR_MUST_HAVE_A_STRING_VALUE");
                }
            case '$notRegexi':
                // Check if the condition value is a string
                if (typeof conditionValue === 'string') {
                    if (conditionFor === "qb") {
                        // Return a FindOperatorQB object for the 'qb' condition
                        return { query: `${a} !~* :${pp}_${a}`, parameters: { [`${pp}_${a}`]: conditionValue } };
                    } else {
                        // Return a Raw object for the 'find' condition
                        return Raw((alias: string) => `${alias} !~* :${pp}_${a}`, { [`${pp}_${a}`]: conditionValue });
                    }
                } else {
                    throw new Error("$NOT_REGEXI_OPERATOR_MUST_HAVE_A_STRING_VALUE");
                }
            case '$jsonContains':
                if (conditionFor === "qb") {
                    // Return a FindOperatorQB object for the 'qb' condition
                    return { query: `${a} @> :${pp}_${a}`, parameters: { [`${pp}_${a}`]: JSON.stringify(conditionValue) } };
                } else {
                    // Return a Raw object for the 'find' condition
                    return Raw((alias: string) => `${alias} @> :${pp}_${a}`, { [`${pp}_${a}`]: JSON.stringify(conditionValue) });
                }
            case '$jsonContained':
                if (conditionFor === "qb") {
                    // Return a FindOperatorQB object for the 'qb' condition
                    return { query: `${a} <@ :${pp}_${a}`, parameters: { [`${pp}_${a}`]: JSON.stringify(conditionValue) } };
                } else {
                    // Return a Raw object for the 'find' condition
                    return Raw((alias: string) => `${alias} <@ :${pp}_${a}`, { [`${pp}_${a}`]: JSON.stringify(conditionValue) });
                }
            case '$jsonEquals':
                if (conditionFor === "qb") {
                    // Return a FindOperatorQB object for the 'qb' condition
                    return { query: `${a} = :${pp}_${a}`, parameters: { [`${pp}_${a}`]: JSON.stringify(conditionValue) } };
                } else {
                    // Return a Raw object for the 'find' condition
                    return Raw((alias: string) => `${alias} = :${pp}_${a}`, { [`${pp}_${a}`]: JSON.stringify(conditionValue) });
                }
            case '$jsonHasKey':
                if (conditionFor === "qb") {
                    // Return a FindOperatorQB object for the 'qb' condition
                    return { query: `${a} ? :${pp}_${a}_key`, parameters: { [`${pp}_${a}_key`]: conditionValue } };
                } else {
                    // Return a Raw object for the 'find' condition
                    return Raw((alias: string) => `${alias} ? :${pp}_${a}_key`, { [`${pp}_${a}_key`]: conditionValue });
                }
            default:
                // If the condition operator is not a valid operator, then throw an error
                throw new Error(`INVALID_CONDITION_OPERATOR ${conditionOperator}`);
        }
    }
    // If the condition is an array, then return the parsed condition object
    else if (Array.isArray(condition) && condition.every(item => typeof item === 'string' || typeof item === 'number' || item instanceof Date)) {
        return (conditionFor === "qb")
            ?
            // Return a FindOperatorQB object for the 'qb' condition
            { query: `${a} IN (:...${uniqueId}_in_${a})`, parameters: { [`${uniqueId}_in_${a}`]: condition } }
            :
            // Return a Raw object for the 'find' condition
            In(condition);
    }
    else if (condition === "$isNull") {
        return (conditionFor === "qb")
            ?
            // Return a FindOperatorQB object for the 'qb' condition
            { query: `${a} IS NULL` }
            :
            // Return a Raw object for the 'find' condition
            IsNull();
    }
    else if (condition === "$isNotNull") {
        return (conditionFor === "qb")
            ?
            // Return a FindOperatorQB object for the 'qb' condition
            { query: `${a} IS NOT NULL` }
            :
            // Return a Raw object for the 'find' condition
            Not(IsNull());
    }
    // If the condition is null, undefined, string, number, boolean, or Date, then return the parsed condition object
    else if (typeof condition === 'string' || typeof condition === 'number' || typeof condition === 'boolean' || condition instanceof Date) {
        return (conditionFor === "qb")
            ?
            // Return a FindOperatorQB object for the 'qb' condition
            { query: `${a} = :${uniqueId}_eq_${a}`, parameters: { [`${uniqueId}_eq_${a}`]: condition } }
            :
            // Return a Raw object for the 'find' condition
            Equal(condition);
    }
    // If the condition is not a valid condition, then throw an error
    else {
        // throw new Error(`Invalid condition, must be an object, array, string, number, boolean, or Date`);
        throw new Error("INVALID_CONDITION");
    }
}
export default parseCondition;
