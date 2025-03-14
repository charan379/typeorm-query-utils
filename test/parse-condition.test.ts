import { expect } from 'chai';
import parseCondition from '../src/parse-condition';
import { In, Not, MoreThanOrEqual, LessThanOrEqual, MoreThan, LessThan, Between, Like, ILike, Equal, IsNull, Raw } from 'typeorm';

describe('parseCondition', () => {
    it('should parse a equalTo condition', () => {
        const result = parseCondition({
            conditionFor: 'qb',
            fieldAlias: 'user.name',
            condition: { $equalTo: 'John' }
        });

        // Use a regular expression to match the query string
        expect(result.query).to.match(/^user\.name = :[a-z0-9_]+_equalTo_user\.name$/);
        expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'John');
    });

    describe('should parse $in operator correctly', () => {
        it('should parse $in operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $in: [1, 2, 3] } });
            expect(result.query).to.match(/^field IN \(:\.\.\.[a-z0-9_]+_in_field\)$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0]).that.is.an("array");
            expect(result.parameters[Object.keys(result.parameters)[0]]).to.deep.equal([1, 2, 3]);
        });

        it('should parse $in operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $in: [1, 2, 3] } });
            expect(result).to.deep.equal(In([1, 2, 3]));
        });

        it("should throw an error when $in operator is used with qb and the value is not an array", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $in: 'not an array' } })).to.throw("$IN_OPERATOR_MUST_HAVE_AN_ARRAY_OF_STRINGS_OR_NUMBERS");
        })
    });

    describe('should parse $notIn operator correctly', () => {
        it('should parse $notIn operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notIn: [5, 6, 7] } });
            expect(result.query).to.match(/^field NOT IN \(:\.\.\.[a-z0-9_]+_notIn_field\)$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0]).that.is.an("array");
            expect(result.parameters[Object.keys(result.parameters)[0]]).to.deep.equal([5, 6, 7]);
        });

        it('should parse $notIn operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notIn: [1, 2, 3] } });
            expect(result).to.deep.equal(Not(In([1, 2, 3])));
        });

        it("should throw an error when $in operator is used with qb and the value is not an array", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notIn: 'not an array' } })).to.throw("$NOTIN_OPERATOR_MUST_HAVE_AN_ARRAY_OF_STRINGS_OR_NUMBERS");
        })
    });

    describe('should parse $gte operator correctly', () => {
        it('should parse $gte operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $gte: 10 } });
            expect(result.query).to.match(/^field >= :[a-z0-9_]+_gte_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 10);
        });

        it('should parse $gte operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $gte: 10 } });
            expect(result).to.deep.equal(MoreThanOrEqual(10));
        });

        it('should throw an error for $gte condition with invalid value', () => {
            expect(() => parseCondition({
                conditionFor: 'qb',
                fieldAlias: 'user.age',
                condition: { $gte: { invalid: 'value' } }
            })).to.throw("$GTE_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
        });
    });

    describe('should parse $lte operator correctly', () => {
        it('should parse $lte operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $lte: 10 } });
            expect(result.query).to.match(/^field <= :[a-z0-9_]+_lte_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 10);
        });

        it('should parse $lte operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $lte: 10 } });
            expect(result).to.deep.equal(LessThanOrEqual(10));
        });

        it('should throw an error for $lte condition with invalid value', () => {
            expect(() => parseCondition({
                conditionFor: 'qb',
                fieldAlias: 'user.age',
                condition: { $lte: { invalid: 'value' } }
            })).to.throw("$LTE_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
        });
    });

    describe('should parse $gt operator correctly', () => {
        it('should parse $gt operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $gt: 10 } });
            expect(result.query).to.match(/^field > :[a-z0-9_]+_gt_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 10);
        });

        it('should parse $gt operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $gt: 10 } });
            expect(result).to.deep.equal(MoreThan(10));
        });

        it('should throw an error for $gt condition with invalid value', () => {
            expect(() => parseCondition({
                conditionFor: 'qb',
                fieldAlias: 'user.age',
                condition: { $gt: { invalid: 'value' } }
            })).to.throw("$GT_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
        });
    });

    describe('should parse $lt operator correctly', () => {
        it('should parse $lt operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $lt: 10 } });
            expect(result.query).to.match(/^field < :[a-z0-9_]+_lt_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 10);
        });

        it('should parse $lt operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $lt: 10 } });
            expect(result).to.deep.equal(LessThan(10));
        });

        it('should throw an error for $lt condition with invalid value', () => {
            expect(() => parseCondition({
                conditionFor: 'qb',
                fieldAlias: 'user.age',
                condition: { $lt: { invalid: 'value' } }
            })).to.throw("$LT_OPERATOR_MUST_HAVE_A_NUMBER_STRING_OR_DATE");
        });
    });

    describe('should parse $between operator correctly', () => {
        it('should parse $between operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $between: [1, 10] } });
            expect(result.query).to.match(/^field BETWEEN :[a-z0-9_]+_between_field_start AND :[a-z0-9_]+_between_field_end$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 1);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[1], 10);
        });

        it('should parse $between operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $between: [1, 10] } });
            expect(result).to.deep.equal(Between(1, 10));
        });

        it('should throw an error for $between condition with invalid value', () => {
            expect(() => parseCondition({
                conditionFor: 'qb',
                fieldAlias: 'user.age',
                condition: { $between: { invalid: 'value' } }
            })).to.throw("$BETWEEN_OPERATOR_MUST_HAVE_AN_ARRAY_WITH_TWO_VALUES");
        });
    });

    describe('should parse $notBetween operator correctly', () => {
        it('should parse $notBetween operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notBetween: [1, 10] } });
            expect(result.query).to.match(/^field NOT BETWEEN :[a-z0-9_]+_notBetween_field_start AND :[a-z0-9_]+_notBetween_field_end$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 1);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[1], 10);
        });

        it('should parse $notBetween operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notBetween: [1, 10] } });
            expect(result).to.deep.equal(Not(Between(1, 10)));
        });

        it('should throw an error for $notBetween condition with invalid value', () => {
            expect(() => parseCondition({
                conditionFor: 'qb',
                fieldAlias: 'user.age',
                condition: { $notBetween: { invalid: 'value' } }
            })).to.throw("$NOT_BETWEEN_OPERATOR_MUST_HAVE_AN_ARRAY_WITH_TWO_VALUES");
        });
    });

    describe('should parse $contains operator correctly', () => {
        it('should parse $contains operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $contains: 'test' } });
            expect(result.query).to.match(/^field LIKE :[a-z0-9_]+_contains_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], '%test%');
        });

        it('should parse $contains operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $contains: 'test' } });
            expect(result).to.deep.equal(Like('%test%'));
        });

        it("should throw an error for $contains operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $contains: {} } })).throw("$CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $notContains operator correctly', () => {
        it('should parse $notContains operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notContains: 'test' } });
            expect(result.query).to.match(/^field NOT LIKE :[a-z0-9_]+_notContains_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], '%test%');
        });

        it('should parse $notContains operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notContains: 'test' } });
            expect(result).to.deep.equal(Not(Like('%test%')));
        });

        it("should throw an error for $notContains operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notContains: {} } })).throw("$NOT_CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $isNull operator correctly', () => {
        it('should parse $isNull operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: '$isNull' });
            expect(result.query).to.equal('field IS NULL');
        });

        it('should parse $isNull operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: '$isNull' });
            expect(result).to.deep.equal(IsNull());
        });
    });

    describe('should parse $iContains operator correctly', () => {
        it('should parse $iContains operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $iContains: 'test' } });
            expect(result.query).to.match(/^field ILIKE :[a-z0-9_]+_iContains_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], '%test%');
        });

        it('should parse $iContains operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $iContains: 'test' } });
            expect(result).to.deep.equal(ILike('%test%'));
        });

        it("should throw an error for $iContains operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $iContains: {} } })).throw("$I_CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $notIContains operator correctly', () => {
        it('should parse $notIContains operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notIContains: 'test' } });
            expect(result.query).to.match(/^field NOT ILIKE :[a-z0-9_]+_notIContains_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], '%test%');
        });

        it('should parse $notIContains operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notIContains: 'test' } });
            expect(result).to.deep.equal(Not(ILike('%test%')));
        });

        it("should throw an error for $notIContains operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notIContains: {} } })).throw("$NOT_I_CONTAINS_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $startsWith operator correctly', () => {
        it('should parse $startsWith operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $startsWith: 'test' } });
            expect(result.query).to.match(/^field LIKE :[a-z0-9_]+_startsWith_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'test%');
        });

        it('should parse $startsWith operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $startsWith: 'test' } });
            expect(result).to.deep.equal(Like('test%'));
        });

        it("should throw an error for $startsWith operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $startsWith: {} } })).throw("$STARTS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $notStartsWith operator correctly', () => {
        it('should parse $notStartsWith operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notStartsWith: 'test' } });
            expect(result.query).to.match(/^field NOT LIKE :[a-z0-9_]+_notStartsWith_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'test%');
        });

        it('should parse $notStartsWith operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notStartsWith: 'test' } });
            expect(result).to.deep.equal(Not(Like('test%')));
        });

        it("should throw an error for $notStartsWith operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notStartsWith: {} } })).throw("$NOT_STARTS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $endsWith operator correctly', () => {
        it('should parse $endsWith operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $endsWith: 'test' } });
            expect(result.query).to.match(/^field LIKE :[a-z0-9_]+_endsWith_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], '%test');
        });

        it('should parse $endsWith operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $endsWith: 'test' } });
            expect(result).to.deep.equal(Like('%test'));
        });

        it("should throw an error for $endsWith operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $endsWith: {} } })).throw("$ENDS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $notEndsWith operator correctly', () => {
        it('should parse $notEndsWith operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notEndsWith: 'test' } });
            expect(result.query).to.match(/^field NOT LIKE :[a-z0-9_]+_notEndsWith_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], '%test');
        });

        it('should parse $notEndsWith operator correctly for find', () => {
            const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notEndsWith: 'test' } });
            expect(result).to.deep.equal(Not(Like('%test')));
        });

        it("should throw an error for $notEndsWith operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notEndsWith: {} } })).throw("$NOT_ENDS_WITH_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $regex operator correctly', () => {
        it('should parse $regex operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $regex: 'test' } });
            expect(result.query).to.match(/^field ~ :[a-z0-9_]+_regex_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'test');
        });

        // it('should parse $regex operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $regex: 'test' } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} ~ :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: 'test' }));
        // });

        it("should throw an error for $regex operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $regex: {} } })).throw("$REGEX_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $notRegex operator correctly', () => {
        it('should parse $notRegex operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notRegex: 'test' } });
            expect(result.query).to.match(/^field !~ :[a-z0-9_]+_notRegex_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'test');
        });

        // it('should parse $notRegex operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notRegex: 'test' } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} !~ :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: 'test' }));
        // });

        it("should throw an error for $notRegex operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notRegex: {} } })).throw("$NOT_REGEX_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $regexi operator correctly', () => {
        it('should parse $regexi operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $regexi: 'test' } });
            expect(result.query).to.match(/^field ~\* :[a-z0-9_]+_regexi_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'test');
        });

        // it('should parse $regexi operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $regexi: 'test' } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} ~* :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: 'test' }));
        // });

        it("should throw an error for $regexi operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $regexi: {} } })).throw("$REGEXI_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $notRegexi operator correctly', () => {
        it('should parse $notRegexi operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notRegexi: 'test' } });
            expect(result.query).to.match(/^field !~\* :[a-z0-9_]+_notRegexi_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'test');
        });

        // it('should parse $notRegexi operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $notRegexi: 'test' } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} !~* :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: 'test' }));
        // });

        it("should throw an error for $notRegexi operator with invalid value", () => {
            expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $notRegexi: {} } })).throw("$NOT_REGEXI_OPERATOR_MUST_HAVE_A_STRING_VALUE");
        })
    });

    describe('should parse $jsonContains operator correctly', () => {
        it('should parse $jsonContains operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $jsonContains: { key: 'value' } } });
            expect(result.query).to.match(/^field @> :[a-z0-9_]+_jsonContains_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], JSON.stringify({ key: 'value' }));
        });

        // it('should parse $jsonContains operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $jsonContains: { key: 'value' } } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} @> :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: JSON.stringify({ key: 'value' }) }));
        // });
    });

    describe('should parse $jsonContained operator correctly', () => {
        it('should parse $jsonContained operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $jsonContained: { key: 'value' } } });
            expect(result.query).to.match(/^field <@ :[a-z0-9_]+_jsonContained_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], JSON.stringify({ key: 'value' }));
        });

        // it('should parse $jsonContained operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $jsonContained: { key: 'value' } } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} <@ :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: JSON.stringify({ key: 'value' }) }));
        // });
    });

    describe('should parse $jsonEquals operator correctly', () => {
        it('should parse $jsonEquals operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $jsonEquals: { key: 'value' } } });
            expect(result.query).to.match(/^field = :[a-z0-9_]+_jsonEquals_field$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], JSON.stringify({ key: 'value' }));
        });

        // it('should parse $jsonEquals operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $jsonEquals: { key: 'value' } } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} = :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: JSON.stringify({ key: 'value' }) }));
        // });
    });

    describe('should parse $jsonHasKey operator correctly', () => {
        it('should parse $jsonHasKey operator correctly for qb', () => {
            const result = parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $jsonHasKey: 'key' } });
            expect(result.query).to.match(/^field \? :[a-z0-9_]+_jsonHasKey_field_key$/);
            expect(result.parameters).to.have.property(Object.keys(result.parameters)[0], 'key');
        });

        // it('should parse $jsonHasKey operator correctly for find', () => {
        //     const result = parseCondition({ conditionFor: 'find', fieldAlias: 'field', condition: { $jsonHasKey: 'key' } });
        //     expect(result).to.deep.equal(Raw(alias => `${alias} ? :${Object.keys(result.parameters)[0]}`, { [Object.keys(result.parameters)[0]]: 'key' }));
        // });
    });

    it('should throw error for unsupported conditionFor value', () => {
        expect(() => parseCondition({ conditionFor: 'unsupported' as 'qb', fieldAlias: 'field', condition: { $in: [1, 2, 3] } })).to.throw('UNSUPPORTED_CONDITION_FOR_VALUE');
    });

    it('should throw error for invalid condition value', () => {
        expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $in: null } })).to.throw('CONDITION_VALUE_CANNOT_BE_UNDEFINED_OR_NULL');
    });

    it('should throw error for invalid condition object', () => {
        expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: null })).to.throw('CONDITION_CANNOT_BE_UNDEFINED_OR_NULL');
    });

    it('should throw an error for qb with empty alias', () => {
        expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: '', condition: {} })).to.throw("ALIAS_MUST_BE_A_NON_EMPTY_STRING");
    })

    it('should throw an error for qb if more then one condition operator is passed into condition', () => {
        expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { $in: [1, 2], $equalTo: "3" } })).to.throw("CONDITION_OBJECT_MUST_HAVE_EXACTLY_ONE_KEY");
    })

    it('should throw an error for qb if an invalid condition operator is passed into condition', () => {
        expect(() => parseCondition({ conditionFor: 'qb', fieldAlias: 'field', condition: { 3: "sd" } })).to.throw("INVALID_CONDITION_OPERATOR 3");
    })

    // Add more test cases as needed for other operators and edge cases
});