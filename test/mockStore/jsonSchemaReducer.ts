import * as Ajv from 'ajv';
import { ActionType, getType } from 'typesafe-actions';
import createValidatableAction from '../../src/createValidateableAction';

const jsonSchema = `{
  "title": "JSONSchema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "age": {
      "description": "Age in years",
      "type": "integer",
      "minimum": 0
    },
    "email": {
      "type": "string"
    },
    "email": {
      "type": "string"
    }
  },
  "additionalProperties": false,
  "required": ["name", "age"]
}
`;

const ajv = new Ajv();
ajv.addSchema(JSON.parse(jsonSchema), 'JSONSchema');

export enum JSONActionTypes {
  action = 'json/action',
  validationFailure = 'json/action/validationFailure',
}

export type JSONSchemaType = {
  name: string;
  age: number;
  email?: string;
  website?: string;
};

export const jsonAction = createValidatableAction(
  [JSONActionTypes.action, JSONActionTypes.validationFailure],
  (payload: JSONSchemaType) => ajv.validate('JSONSchema', payload) || ajv.errors,
);

type JSONActions =
  | ActionType<typeof jsonAction>
  | ActionType<typeof jsonAction.onValidationFailureAction>;

type JSONState = {
  validationSuccess?: JSONSchemaType;
  validationFailure?: false;
};

const initialJsonState: JSONState = {};

export const jsonSchemaReducer = (
  state: JSONState = initialJsonState,
  action: JSONActions,
): JSONState => {
  switch (action.type) {
    case getType(jsonAction):
      return {
        ...state,
        validationSuccess: action.payload,
      };
    case getType(jsonAction.onValidationFailureAction):
      return {
        ...state,
        validationFailure: action.payload,
      };
    default:
      return state;
  }
};
