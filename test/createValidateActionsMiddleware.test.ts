import { waitFor } from '@testing-library/react';
import { AnyFunc } from '../src/functionTypes';
import {
  createReduxTestStoreHomeRolled,
  createReduxTestStoreTypeSafeActions,
  generateTestErrorType,
  generateTestType,
} from './testHelpers';

const mockValidation = jest.fn();

describe('createValidateActionsMiddleware', () => {
  [
    {
      description: 'with typesafe-actions',
      createReduxTestStore: createReduxTestStoreTypeSafeActions,
    },
    {
      description: 'with home rolled action creator',
      createReduxTestStore: createReduxTestStoreHomeRolled,
    },
  ].forEach(({ description, createReduxTestStore }) => {
    describe(description, () => {
      it('valid (validation function returns undefined) the action is reduced as the original would have been', async () => {
        const { store, actionCreator } = createReduxTestStore(mockValidation);
        const expectedPayload = generateTestType();
        const action = actionCreator(expectedPayload);
        mockValidation.mockResolvedValue(void 0);

        (store.dispatch as AnyFunc)(action);

        await waitFor(() =>
          expect(store.getState().success).toEqual(expectedPayload),
        );
      });

      it('valid (validation function returns new payload) the action is reduced as the with the updated payload', async () => {
        const { store, actionCreator } = createReduxTestStore(mockValidation);
        const expectedPayload = generateTestType();
        const action = actionCreator(generateTestType());
        mockValidation.mockResolvedValue(expectedPayload);

        (store.dispatch as AnyFunc)(action);

        await waitFor(() =>
          expect(store.getState().success).toEqual(expectedPayload),
        );
      });

      it('invalid (validation throws error) the failure action is reduced with error', async () => {
        const { store, actionCreator } = createReduxTestStore(mockValidation);
        const expectedPayload = generateTestErrorType();
        const action = actionCreator(generateTestType());
        mockValidation.mockImplementation(async () => {
          throw expectedPayload;
        });

        (store.dispatch as AnyFunc)(action);

        await waitFor(() =>
          expect(store.getState().failure).toEqual(expectedPayload),
        );
      });
    });
  });
});
