import { expect } from "chai";
import sinon from "sinon";
import { SelectQueryBuilder } from "typeorm";
import parseCondition from "../src/parse-condition";
import { applyWhereConditionQB } from "../src";

describe("applyWhereConditionQB", () => {
  let qbMock: sinon.SinonStubbedInstance<SelectQueryBuilder<any>>;

  beforeEach(() => {
    // Mock TypeORM QueryBuilder methods
    qbMock = {
      andWhere: sinon.stub(),
      orWhere: sinon.stub(),
    } as any;
  });

  afterEach(() => {
    sinon.restore(); // Restore original functions after each test
  });

  it("should call parseCondition and apply 'andWhere'", () => {
    // Directly test without stubbing parseCondition
    applyWhereConditionQB(qbMock, "alias", "field", 123, "andWhere");

    // Extract expected values from parseCondition output
    const expected = parseCondition({ fieldAlias: "alias.field", condition: 123, conditionFor: "qb" });
    // Ensure `andWhere` was called with correct values
    expect(qbMock.andWhere.calledOnce).to.be.true;
    expect(qbMock.andWhere.calledWithMatch(/alias\.field\s*=\s*:[a-z0-9_]+_eq_alias\.field/, sinon.match((params: any) => {
      const key = Object.keys(params)[0]; // Get the first parameter key
      return key.match(/[a-z0-9_]+_eq_alias\.field/) && params[key] === Object.values(expected.parameters)[0];
    }))).to.be.true;
  });

  it("should call parseCondition and apply 'orWhere'", () => {
    applyWhereConditionQB(qbMock, "alias", "field", 123, "orWhere");

    const expected = parseCondition({ fieldAlias: "alias.field", condition: 123, conditionFor: "qb" });

    expect(qbMock.orWhere.calledOnce).to.be.true;
    expect(qbMock.orWhere.calledWithMatch(/alias\.field\s*=\s*:[a-z0-9_]+_eq_alias\.field/, sinon.match((params: any) => {
      const key = Object.keys(params)[0]; // Get the first parameter key
      return key.match(/[a-z0-9_]+_eq_alias\.field/) && params[key] === Object.values(expected.parameters)[0];
    }))).to.be.true;
  });
});
