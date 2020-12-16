# validated-actions

A middleware and higher order function to enable validation of actions before they ever reach a reducer

The purpose of this package is to allow typescript user the ability to verify that data from external sources (web requests, flat files, etc.) have the expected shape. However the package itself does not care what the validation function actually does or if you are using the validatable actions in places other than the boundries. This package is influenced heavily by `typesafe-actions` and thus functions like `getType` and types like `ActionType<typeof action>` can work as they would with `typesafe-actions`'s action creators providing yout specify the type of the error type literal in the below examples.

### Install

```bash
$ npm install validated-actions --save
```

### Usage

```typescript
import { makeValidatable } from 'validate-actions';

const validateableActionCreator = makeValidateable(actionCreator)<
  TypeOfErrorResponse,
  typeof errorTypeLiteral
>(errorTypeLiteral, validationFunction);
```

#### Notes on usage

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

##### Example with redux-toolkit

```typescript
// TODO
```

##### Example with hand rolled action creator

```typescript
// TODO
```

###

### Validation Function

TODO
