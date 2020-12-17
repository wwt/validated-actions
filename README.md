![linting](https://github.com/wwt/validated-actions/workflows/linting/badge.svg)
![tests](https://github.com/wwt/validated-actions/workflows/tests/badge.svg)
![build](https://github.com/wwt/validated-actions/workflows/build/badge.svg)

# validated-actions

A middleware and higher order function to enable validation of actions before they ever reach a reducer

The purpose of this package is to allow TypeScript user the ability to verify that data from external sources (web requests, flat files, etc.) have the expected shape. However the package itself does not care what the validation function actually does or if you are using the validatable actions in places other than the boundries. This package is influenced heavily by `typesafe-actions` and thus functions like `getType` and types like `ActionType<typeof action>` can work as they would with `typesafe-actions`'s action creators providing yout specify the type of the error type literal in the below examples.

Currently there isn't support for using `@redux/toolkit` with TypeScript. However, it can be used with JavaScript realitively easily

### Install

```bash
$ npm install @wwt-as/validated-actions --save
```

### Install createValidateActionsMiddleware

```typescript
import { createValidateActionsMiddleware } from '@wwt-as/validated-actions';

const middlewareEnhancer = applyMiddleware(createValidateActionsMiddleware());

const store = createStore(reducer, undefined, middlewareEnhancer);
return { actionCreator: validatableActionCreator, store };
```

### makeValidateable

```typescript
import { makeValidatable } from '@wwt-as/validated-actions';

const validateableActionCreator = makeValidateable(actionCreator)<
  TypeOfErrorResponse,
  typeof errorTypeLiteral
>(errorTypeLiteral, validationFunction);
```

#### Notes on makeValidateable

In order to leverage the typing and avoid pain when trying to reduce the actions, a strongly typed action creator is required.

##### Example with typesafe-actions

```typescript
const actionCreator = makeValidatable(
  createAction(TestActions.testAction)<TestType>(),
)<TestErrorType, typeof TestActions.testActionValidationFailure>(
  TestActions.testActionValidationFailure,
  validationFunction,
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
```

##### Example with hand rolled action creator

```typescript
const originalActionCreator = (payload: TestType) => ({
  type: TestActions.testAction,
  payload,
});

const validatableActionCreator = makeValidatable(originalActionCreator)<
  TestErrorType,
  typeof TestActions.testActionValidationFailure
>(TestActions.testActionValidationFailure, validationFunction);

type TestActionTypes =
  | ReturnType<typeof validatableActionCreator>
  | ReturnType<typeof validatableActionCreator.onValidationFailureAction>;

const reducer = (state = initialState, action: TestActionTypes) => {
  switch (action.type) {
    case TestActions.testAction:
      return { ...state, success: action.payload };
    case TestActions.testActionValidationFailure:
      return { ...state, failure: action.payload as TestErrorType };
    default:
      return state;
  }
};
```

##### Example with @redux/toolit (JavaScript)

```javascript
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
```

### Validation Function

The validation function used can be asynchronous or synchronous. The return value can be void, undefined, or the same type as the original payload. Returning void or undefined, signifies that the original payload was valid and to pass the original action along. Returning a payload type signifies that the original payload was invalid, but you were able to fix the issue, and that the original action can be passed on with the new paylaod instead. To signal that a paylaod is invalid, you must throw an error. the error thrown should be the type specified when creating the validated action, but due to thrown types not having types in typescript you may throw what ever you like.
