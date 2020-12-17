import { Chance } from 'chance';
import { ActionType, createAction, getType } from 'typesafe-actions';
import { ValidationFunction } from '../src/functionTypes';
import { makeValidatable } from '../src/makeValidatable';
import { createStore, applyMiddleware } from 'redux';
import createValidateActionsMiddleware from '../src/createValidateActionsMiddleware';
import * as ReduxToolkit from '@reduxjs/toolkit';

const chance = new Chance();

export type TestType = { name: string; age: number; favoriteColor?: string };
export const generateTestType = (): TestType => ({
  name: chance.name(),
  age: chance.integer({ min: 0, max: 130 }),
  favoriteColor: chance.bool() ? chance.color() : undefined,
});

export type TestErrorType = { key: string; reason: string }[];
export const generateTestErrorType = (): TestErrorType =>
  new Array(chance.integer({ min: 1, max: 10 })).fill(0).map(() => ({
    key: chance.pickone(['name', 'age', 'favoriteColor']),
    reason: chance.paragraph(),
  }));

export enum TestActions {
  testAction = 'test',
  testActionValidationFailure = 'test/validationFailure',
}

export const wait = (ms = 200) =>
  new Promise((resolve) => setTimeout(() => resolve(true), ms));

type TestStateType = {
  success?: TestType;
  failure?: TestErrorType;
};

const initialState: TestStateType = {};

export const createReduxTestStoreTypeSafeActions = (
  validationFunction: ValidationFunction<TestType>,
) => {
  const actionCreator = makeValidatable(
    createAction(TestActions.testAction)<TestType>(),
  )(
    validationFunction,
    createAction(TestActions.testActionValidationFailure)<TestErrorType>(),
  );

  type TestActionTypes =
    | ActionType<typeof actionCreator>
    | ActionType<typeof actionCreator.onValidationFailureAction>;

  const reducer = (
    state = initialState,
    action: TestActionTypes,
  ): TestStateType => {
    switch (action.type) {
      case getType(actionCreator):
        return { ...state, success: action.payload };
      case getType(actionCreator.onValidationFailureAction):
        return { ...state, failure: action.payload };
      default:
        return state;
    }
  };

  const middlewareEnhancer = applyMiddleware(createValidateActionsMiddleware());

  const store = createStore(reducer, undefined, middlewareEnhancer);
  return { actionCreator, store };
};

export const createReduxTestStoreReduxToolkit = (
  validationFunction: ValidationFunction<TestType>,
) => {
  const actionCreator = makeValidatable(
    ReduxToolkit.createAction<TestType>(TestActions.testAction),
  )(
    validationFunction,
    ReduxToolkit.createAction<TestErrorType>(
      TestActions.testActionValidationFailure,
    ),
  );

  const reducer = ReduxToolkit.createReducer({} as TestStateType, (builder) => {
    builder.addCase(actionCreator, (state, action) => ({
      ...state,
      success: action.payload,
    }));
    builder.addCase(
      actionCreator.onValidationFailureAction,
      (state, action) => ({
        ...state,
        failure: action.payload,
      }),
    );
  });
  const middlewareEnhancer = applyMiddleware(createValidateActionsMiddleware());

  const store = createStore(reducer, undefined, middlewareEnhancer);
  return { actionCreator, store };
};

export const createReduxTestStoreHomeRolled = (
  validationFunction: ValidationFunction<TestType>,
) => {
  const validatableActionCreator = makeValidatable((payload: TestType) => ({
    type: TestActions.testAction,
    payload,
  }))(validationFunction, (payload: TestErrorType) => ({
    type: TestActions.testActionValidationFailure,
    payload,
  }));

  type TestActionTypesHomeRolled =
    | ReturnType<typeof validatableActionCreator>
    | ReturnType<typeof validatableActionCreator.onValidationFailureAction>;

  const reducer = (state = initialState, action: TestActionTypesHomeRolled) => {
    switch (action.type) {
      case TestActions.testAction:
        return { ...state, success: action.payload };
      case TestActions.testActionValidationFailure:
        return { ...state, failure: action.payload };
      default:
        return state;
    }
  };
  const middlewareEnhancer = applyMiddleware(createValidateActionsMiddleware());

  const store = createStore(reducer, undefined, middlewareEnhancer);
  return { actionCreator: validatableActionCreator, store };
};
