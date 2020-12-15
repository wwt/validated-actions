import { waitFor } from '@testing-library/react';
import { getType } from 'typesafe-actions';
import { createValidatableAction } from '../src/createValidateableAction';
import { VALIDATE } from '../src/VALIDATE';

enum Actions {
  myAction = 'myAction',
  myActionValidationFailure = 'myAction/validationFailure',
}

type TestType = { a: string; b: number };

const mockNext = jest.fn();
const mockValidation = jest.fn();
const validateType = <IN, OUT>() => (payload: IN): OUT | boolean | null | undefined => {
  const ret = mockValidation(payload);
  return ret;
};

const setup = <TPayload, TValidationError = false>() => {
  const actions = createValidatableAction(
    [Actions.myAction, Actions.myActionValidationFailure],
    validateType<TPayload, TValidationError>(),
  );
  return actions;
};

describe('createValidatableAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates action with correct type', () => {
    const action = setup<boolean>();
    expect(action(true).type).toBe(Actions.myAction);
    expect(getType(action)).toBe(Actions.myAction);
    expect(action.onValidationFailureAction(false).type).toBe(Actions.myActionValidationFailure);
    expect(getType(action.onValidationFailureAction)).toBe(Actions.myActionValidationFailure);
  });

  it('creates action with correct payload', () => {
    type TestType = { a: string; b: number };
    const testPayload: TestType = { a: 'a is a string', b: 123 };
    const action = setup<TestType, TestType>();
    expect(action(testPayload).payload).toEqual(testPayload);
    expect(action.onValidationFailureAction(testPayload).payload).toEqual(testPayload);
  });

  describe('sync', () => {
    describe('payload is valid', () => {
      const testPayload: TestType = { a: 'a is a string', b: 123 };
      [true, null, undefined].forEach((validationResponse) => {
        it(`when validation funtion returns ${validationResponse}`, async () => {
          mockValidation.mockReturnValue(validationResponse);
          const action = setup<TestType, unknown>();
          action(testPayload)[VALIDATE](mockNext);
          await waitFor(() =>
            expect(mockNext).toHaveBeenCalledWith({
              type: Actions.myAction,
              payload: testPayload,
            }),
          );
        });
      });
    });

    describe('payload is invalid', () => {
      const testPayload: TestType = { a: 'a is a string', b: 123 };
      [
        [false, 'false'],
        ['', 'a falsey string'],
        ['string', 'a truthy string'],
        [0, 'a falsey number'],
        [42, 'a truthy number'],
        [testPayload, 'an object'],
        [[], 'an array'],
      ].forEach(([validationResponse, testDescription]) => {
        it(`when validation funtion returns ${testDescription}`, async () => {
          mockValidation.mockReturnValue(validationResponse);
          const action = setup<TestType, unknown>();
          action(testPayload)[VALIDATE](mockNext);
          await waitFor(() =>
            expect(mockNext).toHaveBeenCalledWith({
              type: Actions.myActionValidationFailure,
              payload: validationResponse,
            }),
          );
        });
      });
    });

    describe('payload is invalid (thrown)', () => {
      const testPayload: TestType = { a: 'a is a string', b: 123 };
      [
        [false, 'false'],
        ['', 'a falsey string'],
        ['string', 'a truthy string'],
        [0, 'a falsey number'],
        [42, 'a truthy number'],
        [testPayload, 'an object'],
        [[], 'an array'],
      ].forEach(([validationResponse, testDescription]) => {
        it(`when validation funtion returns ${testDescription}`, async () => {
          mockValidation.mockImplementation(() => {
            throw validationResponse;
          });
          const action = setup<TestType, unknown>();
          action(testPayload)[VALIDATE](mockNext);
          await waitFor(() =>
            expect(mockNext).toHaveBeenCalledWith({
              type: Actions.myActionValidationFailure,
              payload: validationResponse,
            }),
          );
        });
      });
    });
  });

  describe('async', () => {
    describe('payload is valid', () => {
      const testPayload: TestType = { a: 'a is a string', b: 123 };
      [true, null, undefined].forEach((validationResponse) => {
        it(`when validation funtion returns ${validationResponse}`, async () => {
          mockValidation.mockResolvedValue(validationResponse);
          const action = setup<TestType, unknown>();
          action(testPayload)[VALIDATE](mockNext);
          await waitFor(() =>
            expect(mockNext).toHaveBeenCalledWith({
              type: Actions.myAction,
              payload: testPayload,
            }),
          );
        });
      });
    });

    describe('payload is invalid', () => {
      const testPayload: TestType = { a: 'a is a string', b: 123 };
      [
        [false, 'false'],
        ['', 'a falsey string'],
        ['string', 'a truthy string'],
        [0, 'a falsey number'],
        [42, 'a truthy number'],
        [testPayload, 'an object'],
        [[], 'an array'],
      ].forEach(([validationResponse, testDescription]) => {
        it(`when validation funtion returns ${testDescription}`, async () => {
          mockValidation.mockResolvedValue(validationResponse);
          const action = setup<TestType, unknown>();
          action(testPayload)[VALIDATE](mockNext);
          await waitFor(() =>
            expect(mockNext).toHaveBeenCalledWith({
              type: Actions.myActionValidationFailure,
              payload: validationResponse,
            }),
          );
        });
      });
    });

    describe('payload is invalid (thrown)', () => {
      const testPayload: TestType = { a: 'a is a string', b: 123 };
      [
        [false, 'false'],
        ['', 'a falsey string'],
        ['string', 'a truthy string'],
        [0, 'a falsey number'],
        [42, 'a truthy number'],
        [testPayload, 'an object'],
        [[], 'an array'],
      ].forEach(([validationResponse, testDescription]) => {
        it(`when validation funtion returns ${testDescription}`, async () => {
          mockValidation.mockRejectedValue(validationResponse);
          const action = setup<TestType, unknown>();
          action(testPayload)[VALIDATE](mockNext);
          await waitFor(() =>
            expect(mockNext).toHaveBeenCalledWith({
              type: Actions.myActionValidationFailure,
              payload: validationResponse,
            }),
          );
        });
      });
    });
  });
});
