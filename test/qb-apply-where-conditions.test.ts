import { expect } from "chai";
import sinon from "sinon";
import { WhereExpressionBuilder, Brackets } from "typeorm";
import { applyWhereConditionsQB, parseCondition } from "../src";

describe("applyWhereConditionsQB", () => {
  let qbMock: sinon.SinonStubbedInstance<WhereExpressionBuilder>;

  beforeEach(() => {
    // Mock TypeORM WhereExpressionBuilder methods
    qbMock = {
      andWhere: sinon.stub(),
      orWhere: sinon.stub(),
    } as any;
  });

  afterEach(() => {
    sinon.restore(); // Restore original functions after each test
  });

  it("should apply a simple condition using 'andWhere'", () => {
    applyWhereConditionsQB(qbMock, "andWhere", { name: "John" }, "entity");

    expect(qbMock.andWhere.calledOnce).to.be.true;
    expect(qbMock.andWhere.calledWithMatch(
      /entity\.name\s*=\s*:[a-z0-9_]+_eq_entity\.name/,
      sinon.match((params: any) => {
        const key = Object.keys(params)[0];
        return key.match(/[a-z0-9_]+_eq_entity\.name/) && params[key] === "John";
      })
    )).to.be.true;
  });

  it("should apply a simple condition using 'orWhere'", () => {
    applyWhereConditionsQB(qbMock, "orWhere", { age: 30 }, "entity");

    expect(qbMock.orWhere.calledOnce).to.be.true;
    expect(qbMock.orWhere.calledWithMatch(
      /entity\.age\s*=\s*:[a-z0-9_]+_eq_entity\.age/,
      sinon.match((params: any) => {
        const key = Object.keys(params)[0];
        return key.match(/[a-z0-9_]+_eq_entity\.age/) && params[key] === 30;
      })
    )).to.be.true;
  });

  it("should apply conditions with `$or`", () => {
    applyWhereConditionsQB(qbMock, "orWhere", { $or: [{ age: 30 }, { age: 40 }] }, "entity");

    expect(qbMock.orWhere.calledOnce).to.be.true;
    expect(qbMock.orWhere.firstCall.args[0]).to.be.instanceOf(Brackets);
  });

  it("should apply conditions with `$and`", () => {
    applyWhereConditionsQB(qbMock, "andWhere", { $and: [{ age: 30 }, { age: 40 }] }, "entity");

    expect(qbMock.andWhere.calledOnce).to.be.true;
    expect(qbMock.andWhere.firstCall.args[0]).to.be.instanceOf(Brackets);
  });

  it("should handle related entity fields", () => {
    applyWhereConditionsQB(qbMock, "andWhere", { "user.age": 25 }, "entity");


    expect(qbMock.andWhere.calledOnce).to.be.true;
    expect(qbMock.andWhere.calledWithMatch(
      /user\.age\s*=\s*:[a-z0-9_]+_eq_user\.age/,
      sinon.match((params: any) => {
        const key = Object.keys(params)[0];
        return key.match(/[a-z0-9_]+_eq_user\.age/) && params[key] === 25;
      })
    )).to.be.true;
  });

  it("should throw an error when condition parsing fails", () => {
    expect(() => applyWhereConditionsQB(qbMock, "andWhere", { invalidField: {} }, "entity")).to.throw().with.property("name", "TypeORM_QUERY_CONDITION_PARSING_ERROR");
  });
});
