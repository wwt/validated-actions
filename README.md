# validated-actions

A middleware and higher order function to enable validation of actions before they ever reach a reducer

The purpose of this package is to allow typescript user the ability to verify that data from external sources (web requests, flat files, etc.) have the expected shape. However the package itself does not care what the validation function actually does or if you are using the validatable actions in places other than the boundries. This package is influenced heavily by `typesafe-actions` and thus functions like `getType` and types like `ActionType<typeof action>` work as they would with `typesafe-actions`'s action.

### Install

```bash
$ npm install redux-validated-actions --save
```

### Example

creating actions

```typescript
import createValidatableAction from 'redux-validated-action';

enum MyValidateableActionTypes = {
  MyAction = "myaction",
  MyActionValidationFailure = "myaction/validationFailure"
}

const myValidationFunction = (payload: MyActionsPayload): null | undefiend | true | MyActionInvalidResponse => {
  /*
  1) The payload is considered valid if this function returns undefined, null, or true.

  2) The payload is considered invalid if this function returns any other value.

  3) The payload is considered invalid if this function throws.

  4) This function can be async without any repercussions.
  */
}

const {
  /*
  Action creator for MyAction
  (payload: MyActionsPayload) => ({
    type: myaction,
    payload: payload
    meta: used by createValidateActionsMiddleware and is stripped off by the time it reaches the reducer
  })
  */
  action: myAction,
  /*
  Action creator for MyActionValidationFailure
  (payload: MyActionInvalidResponse) => ({
    type: myaction/validationFailure,
    payload: payload
  })
  */
  onValidationFailure: myActionValidationFailure
} = createValidatableAction(
  MyValidateableActionTypes.MyAction, // important that these are literals and not computed values
  MyValidateableActionTypes.MyActionValidationFailure // important that these are literals and not computed values
  myValidationFunction
);

```

reducing actions (this section uses `typesafe-actions` and is not dependant on `redux-validated-action`)

```typescript
type IOTSActioMyActionsns =
  | ActionType<typeof myAction>
  | ActionType<typeof myActionValidationFailure>;

export const reducer = (state: MyState = IOTSState, action: MyActions): MyState => {
  switch (action.type) {
    case getType(myAction):
    /*
        do something knowing action.payload is of type MyAction
      */
    case getType(myActionValidationFailure):
    /*
        do something knowing action.payload is of type MyActionValidationFailure
      */
    default:
      return state;
  }
};
```

adding the middleware

```typescript
const middlewareEnhancer = applyMiddleware(createValidateActionsMiddleware());
const strore = createStore(reducer, undefined, middlewareEnhancer);
```

### Notes

1. If the validation function fails, the original action is turned into the onValidationFailure, with the results of the validation function
   being passed as the payload.
1. If the validation function passes, the original action is passed on without the [validation] property.
1. This package's functionality was tested with `yup`, `io-ts`, and `ajv`
