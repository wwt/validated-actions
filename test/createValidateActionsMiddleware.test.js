/* eslint-disable @typescript-eslint/no-var-requires */
const { waitFor } = require('@testing-library/react');
const { createStore, applyMiddleware } = require('redux');
const { createAction, createReducer } = require('@reduxjs/toolkit');
const { makeValidatable } = require('../src/makeValidatable');
const {
  default: createValidateActionsMiddleware,
} = require('../src/createValidateActionsMiddleware');
const {
  TestActions,
  generateTestType,
  generateTestErrorType,
} = require('./testHelpers');

const mockValidation = jest.fn();

const createReduxTestStore = (validationFunction) => {
  const actionCreator = makeValidatable(createAction(TestActions.testAction))(
    TestActions.testActionValidationFailure,
    validationFunction,
  );

  const reducer = createReducer(
    {},
    {
      [TestActions.testAction]: (state, action) => ({
        ...state,
        success: action.payload,
      }),
      [TestActions.testActionValidationFailure]: (state, action) => ({
        ...state,
        failure: action.payload,
      }),
    },
  );
  const middlewareEnhancer = applyMiddleware(createValidateActionsMiddleware());

  const store = createStore(reducer, undefined, middlewareEnhancer);
  return { actionCreator, store };
};

describe('createValidateActionsMiddleware', () => {
  describe('with redux-toolkit', () => {
    it('valid (validation function returns undefined) the action is reduced as the original would have been', async () => {
      const { store, actionCreator } = createReduxTestStore(mockValidation);
      const expectedPayload = generateTestType();
      const action = actionCreator(expectedPayload);
      mockValidation.mockResolvedValue(void 0);

      store.dispatch(action);

      await waitFor(() =>
        expect(store.getState().success).toEqual(expectedPayload),
      );
    });

    it('valid (validation function returns new payload) the action is reduced as the with the updated payload', async () => {
      const { store, actionCreator } = createReduxTestStore(mockValidation);
      const expectedPayload = generateTestType();
      const action = actionCreator(generateTestType());
      mockValidation.mockResolvedValue(expectedPayload);

      store.dispatch(action);

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

      store.dispatch(action);

      await waitFor(() =>
        expect(store.getState().failure).toEqual(expectedPayload),
      );
    });
  });
});
