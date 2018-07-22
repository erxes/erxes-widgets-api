import { checkRules, checkRule } from '../data/resolvers/utils/engage';

const browserLanguageRule = {
  kind: 'browserLanguage',
  condition: 'is',
  value: 'en',
};

describe('checkRules', () => {
  test('browserLanguage: not matched', async () => {
    const response = await checkRules({
      rules: [browserLanguageRule],
      browserInfo: { language: 'mn' },
    });

    expect(response).toBe(false);
  });

  test('browserLanguage: not all rules matched', async () => {
    const response = await checkRules({
      rules: [
        browserLanguageRule,
        {
          kind: 'browserLanguage',
          condition: 'is',
          value: 'mn',
        },
      ],

      browserInfo: { language: 'en' },
    });

    expect(response).toBe(false);
  });

  test('browserLanguage: all rules matched', async () => {
    const response = await checkRules({
      rules: [browserLanguageRule, browserLanguageRule],
      browserInfo: { language: 'en' },
    });

    expect(response).toBe(true);
  });
});

describe('checkIndividualRule', () => {
  // is
  test('is: not matching', () => {
    const response = checkRule({
      rule: browserLanguageRule,
      browserInfo: { language: 'mn' },
    });

    expect(response).toBe(false);
  });

  test('is: matching', () => {
    const response = checkRule({
      rule: browserLanguageRule,
      browserInfo: { language: 'en' },
    });

    expect(response).toBe(true);
  });

  // isNot
  const isNotRule = {
    kind: 'currentPageUrl',
    condition: 'isNot',
    value: '/page',
  };

  test('isNot: not matching', () => {
    const response = checkRule({
      rule: isNotRule,
      browserInfo: { url: '/page' },
    });

    expect(response).toBe(false);
  });

  test('isNot: matching', () => {
    const response = checkRule({
      rule: isNotRule,
      browserInfo: { url: '/category' },
    });

    expect(response).toBe(true);
  });

  // isUnknown
  const isUnknownRule = {
    kind: 'city',
    condition: 'isUnknown',
  };

  test('isUnknown: not matching', () => {
    const response = checkRule({
      rule: isUnknownRule,
      browserInfo: { city: 'Ulaanbaatar' },
    });

    expect(response).toBe(false);
  });

  test('isUnknown: matching', () => {
    const response = checkRule({
      rule: isUnknownRule,
      browserInfo: {},
    });

    expect(response).toBe(true);
  });

  // hasAnyValue
  const hasAnyValueRule = {
    kind: 'country',
    condition: 'hasAnyValue',
  };

  test('hasAnyValue: not matching', () => {
    const response = checkRule({
      rule: hasAnyValueRule,
      browserInfo: {},
    });

    expect(response).toBe(false);
  });

  test('hasAnyValue: matching', () => {
    const response = checkRule({
      rule: hasAnyValueRule,
      browserInfo: { country: 'MN' },
    });

    expect(response).toBe(true);
  });

  // startsWith
  const startsWithRule = {
    kind: 'browserLanguage',
    condition: 'startsWith',
    value: 'en',
  };

  test('startsWith: not matching', () => {
    const response = checkRule({
      rule: startsWithRule,
      browserInfo: { language: 'mongolian' },
    });

    expect(response).toBe(false);
  });

  test('startsWith: matching', () => {
    const response = checkRule({
      rule: startsWithRule,
      browserInfo: { language: 'english' },
    });

    expect(response).toBe(true);
  });

  // endsWith
  const endsWithRule = {
    kind: 'browserLanguage',
    condition: 'endsWith',
    value: 'ian',
  };

  test('endsWith: not matching', () => {
    const response = checkRule({
      rule: endsWithRule,
      browserInfo: { language: 'english' },
    });

    expect(response).toBe(false);
  });

  test('endsWith: matching', () => {
    const response = checkRule({
      rule: endsWithRule,
      browserInfo: { language: 'mongolian' },
    });

    expect(response).toBe(true);
  });

  // greaterThan
  const greaterThanRule = {
    kind: 'numberOfVisits',
    condition: 'greaterThan',
    value: '1',
  };

  test('greaterThan: not matching', () => {
    const response = checkRule({
      rule: greaterThanRule,
      browserInfo: {},
      numberOfVisits: 0,
    });

    expect(response).toBe(false);
  });

  test('greaterThan: matching', () => {
    const response = checkRule({
      rule: greaterThanRule,
      browserInfo: {},
      numberOfVisits: 2,
    });

    expect(response).toBe(true);
  });

  // lessThan
  const lessThanRule = {
    kind: 'numberOfVisits',
    condition: 'lessThan',
    value: '1',
  };

  test('lessThan: not matching', () => {
    const response = checkRule({
      rule: lessThanRule,
      browserInfo: {},
      numberOfVisits: 2,
    });

    expect(response).toBe(false);
  });

  test('lessThan: matching', () => {
    const response = checkRule({
      rule: lessThanRule,
      browserInfo: {},
      numberOfVisits: 0,
    });

    expect(response).toBe(true);
  });

  // contains ======
  const containsRule = {
    kind: 'currentPageUrl',
    condition: 'contains',
    value: 'page',
  };

  test('contains: not matching', () => {
    const response = checkRule({
      rule: containsRule,
      browserInfo: { url: '/test' },
    });

    expect(response).toBe(false);
  });

  test('contains: matching', () => {
    const response = checkRule({
      rule: containsRule,
      browserInfo: { url: '/page' },
    });

    expect(response).toBe(true);
  });
});
