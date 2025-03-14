# TypeORM Query Utils

A TypeORM utility library that simplifies query building with advanced filtering, sorting, and condition parsing.

## Installation

```sh
npm install @charan379/typeorm-query-utils
```

## Usage

### Importing the Utilities

```typescript
import { applyFiltersQB, applySortOrderQB, applyWhereConditionQB, applyWhereConditionsQB, parseCondition } from '@charan379/typeorm-query-utils';
```

### Applying Filters

Use `applyFiltersQB` to apply filters to a TypeORM Query Builder.

```typescript
import { createQueryBuilder } from 'typeorm';
import { applyFiltersQB } from '@charan379/typeorm-query-utils';

const qb = createQueryBuilder('entity');
const filters = { name: 'John', age: { $gte: 30 } };

applyFiltersQB(qb, 'entity', filters);
```

### Applying Sort Order

Use `applySortOrderQB` to apply sorting to a TypeORM Query Builder.

```typescript
import { createQueryBuilder } from 'typeorm';
import { applySortOrderQB } from '@charan379/typeorm-query-utils';

const qb = createQueryBuilder('entity');
const sort = { name: 'ascend', age: 'descend' };

applySortOrderQB(qb, sort);
```

### Applying Where Condition

Use `applyWhereConditionQB` to apply a single condition to a TypeORM Query Builder.

```typescript
import { createQueryBuilder } from 'typeorm';
import { applyWhereConditionQB } from '@charan379/typeorm-query-utils';

const qb = createQueryBuilder('entity');
applyWhereConditionQB(qb, 'entity', 'name', 'John', 'andWhere');
```

### Applying Multiple Where Conditions

Use `applyWhereConditionsQB` to recursively apply multiple conditions to a TypeORM Query Builder.

```typescript
import { createQueryBuilder } from 'typeorm';
import { applyWhereConditionsQB } from '@charan379/typeorm-query-utils';

const qb = createQueryBuilder('entity');
const conditions = { name: 'John', $or: [{ age: 30 }, { age: 40 }] };

applyWhereConditionsQB(qb, 'andWhere', conditions, 'entity');
```

### Parsing Conditions

Use `parseCondition` to parse conditions into a TypeORM-compatible format.

```typescript
import { parseCondition } from '@charan379/typeorm-query-utils';

const condition = { $gte: 30 };
const parsedCondition = parseCondition({ conditionFor: 'qb', fieldAlias: 'entity.age', condition });
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
