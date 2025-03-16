import { expect } from 'chai';
import sinon from 'sinon';
import { SelectQueryBuilder } from 'typeorm';
import applySortOrderQB from '../src/qb-apply-sort-order'; // Adjust the import path

describe('applySortOrderQB', () => {
    let queryBuilder: sinon.SinonStubbedInstance<SelectQueryBuilder<any>>;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock TypeORM QueryBuilder
        queryBuilder = {
            alias: 'user',
            addOrderBy: sandbox.stub().returnsThis(),
        } as unknown as sinon.SinonStubbedInstance<SelectQueryBuilder<any>>;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should apply sorting for single field', () => {
        const sort: Record<string, SortOrder> = { name: 'ascend' };
        applySortOrderQB(queryBuilder, sort);

        expect(queryBuilder.addOrderBy.calledOnceWithExactly('user.name', 'ASC')).to.be.true;
    });

    it('should apply sorting for multiple fields', () => {
        const sort: Record<string, SortOrder> = { name: 'ascend', age: 'descend' };
        applySortOrderQB(queryBuilder, sort);

        expect(queryBuilder.addOrderBy.calledTwice).to.be.true;
        expect(queryBuilder.addOrderBy.calledWithExactly('user.name', 'ASC')).to.be.true;
        expect(queryBuilder.addOrderBy.calledWithExactly('user.age', 'DESC')).to.be.true;
    });

    it('should handle different sorting order variations', () => {
        const sort: Record<string, SortOrder> = {
            name: 'asc',
            age: 'descending',
            createdAt: -1,
            updatedAt: 1
        };
        
        applySortOrderQB(queryBuilder, sort);

        expect(queryBuilder.addOrderBy.callCount).to.equal(4);
        expect(queryBuilder.addOrderBy.calledWithExactly('user.name', 'ASC')).to.be.true;
        expect(queryBuilder.addOrderBy.calledWithExactly('user.age', 'DESC')).to.be.true;
        expect(queryBuilder.addOrderBy.calledWithExactly('user.createdAt', 'DESC')).to.be.true;
        expect(queryBuilder.addOrderBy.calledWithExactly('user.updatedAt', 'ASC')).to.be.true;
    });

    it('should apply sorting for nested fields', () => {
        const sort: Record<string, SortOrder> = { 'profile.age': 'ascend' };
        applySortOrderQB(queryBuilder, sort);

        expect(queryBuilder.addOrderBy.calledOnceWithExactly('profile.age', 'ASC')).to.be.true;
    });

    it('should not apply sorting when sort object is empty', () => {
        applySortOrderQB(queryBuilder, {});

        expect(queryBuilder.addOrderBy.called).to.be.false;
    });
});
