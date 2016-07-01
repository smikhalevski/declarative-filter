import 'babel-polyfill';
import assert, {equal, notEqual, deepEqual, strictEqual, throws} from 'assert';
import {
  FREE_TEXT,
  EQ,
  NE,
  LT,
  GT,
  LTE,
  GTE,
  LIKE,
  IN,
  BETWEEN,
  NOT,
  OR,
  AND,
  reduceFreeTextOperatorValue,
  reduceBinaryOperatorValue,
  reduceNegationOperatorValue,
  reduceFieldOperatorValue,
  reduceLogicalOperatorValue,
  reduceFilter,
  toMatcher
} from '../main/FilterModel';

describe('reduceFreeTextOperatorValue', () => {
  it(`requires string value`, () => {
    deepEqual(reduceFreeTextOperatorValue('foo', {}), 'foo');
    throws(() => reduceFreeTextOperatorValue(1, {}));
    throws(() => reduceFreeTextOperatorValue({}, {}));
  });
});

describe('reduceBinaryOperatorValue', () => {
  it(`requires array of two scalars for ${BETWEEN}`, () => {
    deepEqual(reduceBinaryOperatorValue(BETWEEN, [1, 2], {}), [1, 2]);
    throws(() => reduceBinaryOperatorValue(BETWEEN, [1, 2, 3], {}));
  });

  it(`requires array of scalars for ${IN}`, () => {
    deepEqual(reduceBinaryOperatorValue(IN, [1, 2], {}), [1, 2]);
    deepEqual(reduceBinaryOperatorValue(IN, [], {}), []);
  });
});

describe('reduceNegationOperatorValue', () => {
  it(`converts scalar value to ${EQ} operator`, () => {
    deepEqual(reduceNegationOperatorValue('foo', {}), {[EQ]: 'foo'});
  });

  it('expects scalar or single binary operator', () => {
    deepEqual(reduceNegationOperatorValue({[EQ]: 1}, {}), {[EQ]: 1});
    throws(() => reduceNegationOperatorValue([], {}));
    throws(() => reduceNegationOperatorValue({}, {}));
    throws(() => reduceNegationOperatorValue({[FREE_TEXT]: 'foo'}, {}));
    throws(() => reduceNegationOperatorValue({[AND]: []}, {}));
    throws(() => reduceNegationOperatorValue({[OR]: []}, {}));
    throws(() => reduceNegationOperatorValue({[NOT]: {[EQ]: 1}}, {}));
  });
});

describe('reduceFieldOperatorValue', () => {
  it(`converts scalar value to ${EQ} operator`, () => {
    deepEqual(reduceFieldOperatorValue('foo', {}), {[EQ]: 'foo'});
  });

  it('expects scalar or single binary or negation operator', () => {
    deepEqual(reduceFieldOperatorValue({[EQ]: 1}, {}), {[EQ]: 1});
    deepEqual(reduceFieldOperatorValue({[NOT]: {[EQ]: 1}}, {}), {[NOT]: {[EQ]: 1}});
    throws(() => reduceNegationOperatorValue([], {}));
    throws(() => reduceNegationOperatorValue({}, {}));
    throws(() => reduceNegationOperatorValue({[FREE_TEXT]: 'foo'}, {}));
    throws(() => reduceNegationOperatorValue({[AND]: []}, {}));
    throws(() => reduceNegationOperatorValue({[OR]: []}, {}));
  });
});

describe('reduceLogicalOperatorValue', () => {
  it('accepts objects with several keys', () => {
    deepEqual(reduceLogicalOperatorValue({foo: 1, bar: {[NOT]: 2}}, {}), [
      {foo: {[EQ]: 1}},
      {
        bar: {
          [NOT]: {[EQ]: 2}
        }
      }
    ]);
  });

  it('accepts array of objects', () => {
    deepEqual(reduceLogicalOperatorValue([{bar: 1, foo: {[GT]: 1}}, {foo: {[LT]: 2}}], {}), [
      {bar: {[EQ]: 1}},
      {foo: {[GT]: 1}},
      {foo: {[LT]: 2}}
    ]);
  });
});

describe('reduceFilter', () => {
  it('accepts objects with several keys', () => {
    deepEqual(reduceFilter({foo: 1, bar: {[NOT]: 2}}, {}), {
      [AND]: [
        {foo: {[EQ]: 1}},
        {
          bar: {
            [NOT]: {[EQ]: 2}
          }
        }
      ]
    });
  });

  it('accepts array of objects', () => {
    deepEqual(reduceFilter([{bar: 1, foo: {[GT]: 1}}, {foo: {[LT]: 2}}], {}), {
      [AND]: [
        {bar: {[EQ]: 1}},
        {foo: {[GT]: 1}},
        {foo: {[LT]: 2}}
      ]
    });
  });
});

describe('toMatcher', () => {
  it(`can create ${EQ} matcher`, () => {
    let test = toMatcher({[EQ]: 1});
    assert(test(1));
    assert(!test(2));
  });

  it(`can create ${NE} matcher`, () => {
    let test = toMatcher({[NE]: 1});
    assert(!test(1));
    assert(test(2));
  });

  it(`can create ${LT} matcher`, () => {
    let test = toMatcher({[LT]: 1});
    assert(test(0));
    assert(!test(1));
    assert(!test(2));
  });

  it(`can create ${GT} matcher`, () => {
    let test = toMatcher({[GT]: 1});
    assert(test(2));
    assert(!test(1));
    assert(!test(0));
  });

  it(`can create ${LTE} matcher`, () => {
    let test = toMatcher({[LTE]: 1});
    assert(test(0));
    assert(test(1));
    assert(!test(2));
  });

  it(`can create ${GTE} matcher`, () => {
    let test = toMatcher({[GTE]: 1});
    assert(test(2));
    assert(test(1));
    assert(!test(0));
  });

  it(`can create ${NOT} matcher`, () => {
    let test = toMatcher({[NOT]: {[GTE]: 1}});
    assert(test(0));
    assert(!test(1));
    assert(!test(2));
  });

  it(`can create ${LIKE} matcher`, () => {
    let test = toMatcher({[LIKE]: 'a%b$'});
    assert(test('ab$'));
    assert(test('a__b$'));
    assert(!test('_ab$_'));
    assert(!test('ab$_'));
    assert(!test('_ab$'));
  });

  it(`can create ${IN} matcher`, () => {
    let test = toMatcher({[IN]: ['foo', 'bar']});
    assert(test('foo'));
    assert(test('bar'));
    assert(!test('qux'));
  });

  it(`can create ${BETWEEN} matcher`, () => {
    let test = toMatcher({[BETWEEN]: [1, 2]});
    assert(test(1));
    assert(test(2));
    assert(test(1.5));
    assert(!test(0));
    assert(!test(3));
  });

  it(`can create ${FREE_TEXT} matcher`, () => {
    let test = toMatcher({[FREE_TEXT]: '123'});
    assert(test({a: 'bar', b: '_123_'}));
    assert(!test({123: 'bar'}));
    assert(!test({a: 123}));
    assert(!test({a: '1', b: '23'}));
  });

  it(`can create ${AND} matcher`, () => {
    let test = toMatcher({[AND]: [{foo: {[EQ]: 1}}, {bar: {[EQ]: 2}}]});
    assert(test({foo: 1, bar: 2}));
    assert(!test({foo: 0, bar: 2}));
    assert(!test({foo: 1}));
  });

  it(`can create ${OR} matcher`, () => {
    let test = toMatcher({[OR]: [{foo: {[EQ]: 1}}, {bar: {[EQ]: 2}}]});
    assert(test({foo: 1, bar: 3}));
    assert(test({foo: 0, bar: 2}));
    assert(test({foo: 1}));
    assert(test({bar: 2}));
    assert(!test({foo: 0, bar: 3}));
  });

  it(`ignores empty ${OR} operator`, () => {
    let test = toMatcher({[OR]: []});
    strictEqual(test, null);
  });

  it(`ignores nested empty ${AND} operators`, () => {
    let test = toMatcher({[OR]: [{[AND]: []}, {foo: {[EQ]: 1}}]});
    assert(test({foo: 1}));
    assert(!test({foo: 2}));
  });

  it(`ignores nested empty ${OR} operators`, () => {
    let test = toMatcher({[OR]: [{[OR]: []}, {foo: {[EQ]: 1}}]});
    assert(test({foo: 1}));
    assert(!test({foo: 2}));
  });
});
