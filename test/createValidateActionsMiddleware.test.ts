import { waitFor } from '@testing-library/react';
import { VALIDATE } from '../src/constants';
import { AnyFunc } from '../src/functionTypes';
import {
  createReduxTestStoreHomeRolled,
  createReduxTestStoreReduxToolkit,
  createReduxTestStoreTypeSafeActions,
  createReduxTestStoreWithDispatchAudit,
  generateTestErrorType,
  generateTestType,
  TestActions,
} from './testHelpers';

const mockValidation = jest.fn();
const dispatchAuditor = jest.fn();

describe('createValidateActionsMiddleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  [
    {
      description: 'with typesafe-actions',
      createReduxTestStore: createReduxTestStoreTypeSafeActions,
    },
    {
      description: 'with home rolled action creator',
      createReduxTestStore: createReduxTestStoreHomeRolled,
    },
    {
      description: 'with @redux/toolkit',
      createReduxTestStore: createReduxTestStoreReduxToolkit,
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

  it('continues through the middleware chain when valid ', async () => {
    const { store, actionCreator } = createReduxTestStoreWithDispatchAudit(
      mockValidation,
      dispatchAuditor,
    );
    const expectedActionPayload = generateTestType();
    const action = actionCreator(expectedActionPayload);
    mockValidation.mockResolvedValue(void 0);

    store.dispatch(action);

    await waitFor(() => expect(dispatchAuditor).toHaveBeenCalledTimes(1));

    expect(dispatchAuditor).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TestActions.testAction,
        payload: expectedActionPayload,
        [VALIDATE]: expect.any(Function),
      }),
    );
  });

  it('restarts the middleware chain when invalid ', async () => {
    const dispatchAuditor = jest.fn();
    const { store, actionCreator } = createReduxTestStoreWithDispatchAudit(
      mockValidation,
      dispatchAuditor,
    );
    const expectedActionPayload = generateTestType();
    const expectedErrorPayload = generateTestErrorType();
    const action = actionCreator(expectedActionPayload);
    mockValidation.mockImplementation(async () => {
      throw expectedErrorPayload;
    });

    store.dispatch(action);

    await waitFor(() => expect(dispatchAuditor).toHaveBeenCalledTimes(2));

    expect(dispatchAuditor).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TestActions.testAction,
        payload: expectedActionPayload,
        [VALIDATE]: expect.any(Function),
      }),
    );
    expect(dispatchAuditor).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TestActions.testActionValidationFailure,
        payload: expectedErrorPayload,
      }),
    );
  });
});
