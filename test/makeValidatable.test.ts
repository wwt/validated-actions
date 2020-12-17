import { createAction, createCustomAction, getType } from 'typesafe-actions';
import { makeValidatable } from '../src/makeValidatable';
import { VALIDATE } from '../src/constants';
import { ValidationFunction } from '../src/functionTypes';
import {
  generateTestErrorType,
  generateTestType,
  TestActions,
  TestErrorType,
  TestType,
  wait,
} from './testHelpers';

const mockNext = jest.fn();

const setupAlwaysPass = () => {
  const originalActionCreator = Object.assign(
    createCustomAction(
      TestActions.testAction,
      (name: string, age: number, favoriteColor?: string) => ({
        payload: { name, age, favoriteColor },
        meta: [name, age, favoriteColor, 'meta'],
        someCustomField: [name, age, favoriteColor, 'someCustomField'],
      }),
    ),
    { fooBarProp: () => 'foobar' },
  );
  const validatableActionCreator = makeValidatable(originalActionCreator)(
    () => void 0,
    createAction(TestActions.testActionValidationFailure)<TestErrorType>(),
  );
  return { originalActionCreator, validatableActionCreator };
};

const setup = (validationFunction: ValidationFunction<TestType>) => {
  const originalActionCreator = Object.assign(
    createCustomAction(
      TestActions.testAction,
      (name: string, age: number, favoriteColor?: string) => ({
        payload: { name, age, favoriteColor } as TestType,
        meta: [name, age, favoriteColor, 'meta'],
        someCustomField: [name, age, favoriteColor, 'someCustomField'],
      }),
    ),
    { fooBarProp: () => 'foobar' },
  );
  const validatableActionCreator = makeValidatable(originalActionCreator)(
    validationFunction,
    createAction(TestActions.testActionValidationFailure)<TestErrorType>(),
  );
  return { originalActionCreator, validatableActionCreator };
};

describe('makeValidateable', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('signature of returned creator', () => {
    it('validated creator has same properties as the original', () => {
      const {
        originalActionCreator,
        validatableActionCreator,
      } = setupAlwaysPass();

      const originalActionCreatorProps = { ...originalActionCreator };
      const validatableActionCreatorProps = { ...validatableActionCreator };

      expect(originalActionCreatorProps.fooBarProp()).toEqual(
        validatableActionCreatorProps.fooBarProp(),
      );

      expect(originalActionCreator.getType).not.toBeUndefined();
      expect(validatableActionCreatorProps.getType).not.toBeUndefined();
      expect(originalActionCreator.getType?.()).toEqual(
        validatableActionCreatorProps.getType?.(),
      );
    });

    it('validated creator has property that holds a reference to the the validationFailure action creator', () => {
      const { validatableActionCreator } = setupAlwaysPass();
      const validationError = generateTestErrorType();

      expect(typeof validatableActionCreator.onValidationFailureAction).toEqual(
        'function',
      );
      expect(
        validatableActionCreator.onValidationFailureAction(validationError),
      ).toEqual({
        type: TestActions.testActionValidationFailure,
        payload: validationError,
      });
    });

    it('validatedCreator.validationFailure has properties that allow typesafe-actions getType and Action tyoe to work with it', () => {
      const { validatableActionCreator } = setupAlwaysPass();

      expect(
        getType(validatableActionCreator.onValidationFailureAction),
      ).toEqual(TestActions.testActionValidationFailure);
    });

    it('return type at least equal to original action', () => {
      const {
        originalActionCreator,
        validatableActionCreator,
      } = setupAlwaysPass();

      const expectedPayload = generateTestType();
      const originalAction = originalActionCreator(
        expectedPayload.name,
        expectedPayload.age,
        expectedPayload.favoriteColor,
      );
      const validatableAction = validatableActionCreator(
        expectedPayload.name,
        expectedPayload.age,
        expectedPayload.favoriteColor,
      );

      expect(validatableAction.type).toEqual(originalAction.type);
      expect(validatableAction.payload).toEqual(originalAction.payload);
      expect(validatableAction.meta).toEqual(originalAction.meta);
      expect(validatableAction.someCustomField).toEqual(
        originalAction.someCustomField,
      );
    });

    describe('validation', () => {
      it('action has VALITADE property', () => {
        const { validatableActionCreator } = setupAlwaysPass();

        const expectedPayload = generateTestType();
        const validatableAction = validatableActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );

        expect(validatableAction[VALIDATE]).not.toBeUndefined();
        expect(typeof validatableAction[VALIDATE]).toEqual('function');
        expect(validatableAction[VALIDATE].length).toEqual(1);
      });

      it('validation function returns with new undefined, [VALIDATE] returns original action with the new payload', async () => {
        const { originalActionCreator, validatableActionCreator } = setup(
          () => void 0,
        );
        const expectedPayload = generateTestType();
        const originalAction = originalActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        const validatableAction = validatableActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        await validatableAction[VALIDATE](mockNext);
        expect(mockNext).toHaveBeenCalledWith(originalAction);
      });

      it('async validation function returns with new undefined, [VALIDATE] returns original action with the new payload', async () => {
        const { originalActionCreator, validatableActionCreator } = setup(
          async () => {
            await wait();
          },
        );
        const expectedPayload = generateTestType();
        const originalAction = originalActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        const validatableAction = validatableActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        await validatableAction[VALIDATE](mockNext);
        expect(mockNext).toHaveBeenCalledWith(originalAction);
      });

      it('validation function returns with new payload, [VALIDATE] returns original action with the new payload', async () => {
        const updatedPayload = generateTestType();
        const { originalActionCreator, validatableActionCreator } = setup(
          () => updatedPayload,
        );
        const expectedPayload = generateTestType();
        const originalAction = originalActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        const validatableAction = validatableActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        await validatableAction[VALIDATE](mockNext);
        expect(mockNext).toHaveBeenCalledWith({
          ...originalAction,
          payload: updatedPayload,
        });
      });

      it('async validation function returns with new payload, [VALIDATE] returns original action with the new payload', async () => {
        const updatedPayload = generateTestType();
        const { originalActionCreator, validatableActionCreator } = setup(
          async () => {
            await wait();
            return updatedPayload;
          },
        );
        const expectedPayload = generateTestType();
        const originalAction = originalActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        const validatableAction = validatableActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        await validatableAction[VALIDATE](mockNext);
        expect(mockNext).toHaveBeenCalledWith({
          ...originalAction,
          payload: updatedPayload,
        });
      });

      it('validation function throws validation error, [VALIDATE] returns validation failure action with error as payload', async () => {
        const validationError = generateTestErrorType();
        const { validatableActionCreator } = setup(() => {
          throw validationError;
        });
        const expectedPayload = generateTestType();
        const validatableAction = validatableActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        const validationFailedAction = {
          type: TestActions.testActionValidationFailure,
          payload: validationError,
        };
        await validatableAction[VALIDATE](mockNext);
        expect(mockNext).toHaveBeenCalledWith(validationFailedAction);
      });

      it('async validation function throws validation error, [VALIDATE] returns validation failure action with error as payload', async () => {
        const validationError = generateTestErrorType();
        const { validatableActionCreator } = setup(async () => {
          await wait();
          throw validationError;
        });
        const expectedPayload = generateTestType();
        const validatableAction = validatableActionCreator(
          expectedPayload.name,
          expectedPayload.age,
          expectedPayload.favoriteColor,
        );
        const validationFailedAction = {
          type: TestActions.testActionValidationFailure,
          payload: validationError,
        };
        await validatableAction[VALIDATE](mockNext);
        expect(mockNext).toHaveBeenCalledWith(validationFailedAction);
      });
    });
  });
});
