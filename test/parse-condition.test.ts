import { expect } from 'chai';
import { parseCondition } from '../src';

describe('parseCondition', () => {
    it('should parse a simple equality condition', () => {
        const result = parseCondition({
            conditionFor: 'qb',
            fieldAlias: 'user.name',
            condition: { $equalTo: 'John' }
        });

        expect(result).to.deep.equal({
            query: 'user.name = :_eq_user_name',
            parameters: { _eq_user_name: 'John' }
        });
    });

    // Add more tests for other conditions and edge cases
});