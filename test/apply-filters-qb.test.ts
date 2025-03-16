import { expect } from 'chai';
import sinon from 'sinon';
import { SelectQueryBuilder } from 'typeorm';
import proxyquire from 'proxyquire';

describe('applyFiltersQB', () => {
    let queryBuilder: sinon.SinonStubbedInstance<SelectQueryBuilder<any>>;
    let applyWhereConditionStub: sinon.SinonStub;
    let applyFiltersQB: any;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock TypeORM QueryBuilder
        queryBuilder = {
            andWhere: sandbox.stub().returnsThis(),
        } as unknown as sinon.SinonStubbedInstance<SelectQueryBuilder<any>>;

        // Stub function
        applyWhereConditionStub = sandbox.stub();

        // Use proxyquire to replace the module before importing it
        applyFiltersQB = proxyquire('../src/qb-apply-filters', {
            '../src/qb-apply-where-condition': {
                default: applyWhereConditionStub,  // Ensure default export replacement
            },
        }).default;
    });

    afterEach(() => {
        sandbox.restore(); // Cleanup after each test
    });

    it('should call applyWhereConditionQB for each filter field', () => {
        const filter = { name: 'John', age: 30 };

        applyFiltersQB(queryBuilder, 'user', filter);

        expect(applyWhereConditionStub.callCount).to.equal(2);
        expect(applyWhereConditionStub.calledWith(queryBuilder, 'user', 'name', 'John', 'andWhere')).to.be.true;
        expect(applyWhereConditionStub.calledWith(queryBuilder, 'user', 'age', 30, 'andWhere')).to.be.true;
    });

    it('should not call applyWhereConditionQB when filter is empty', () => {
        applyFiltersQB(queryBuilder, 'user', {});

        expect(applyWhereConditionStub.called).to.be.false;
    });
});
