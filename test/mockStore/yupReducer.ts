import * as yup from 'yup';
import { ActionType, getType } from 'typesafe-actions';
import createValidatableAction from '../../src/createValidateableAction';

export enum YupActionTypes {
  action = 'yup/action',
  actionAsync = 'yup/action/async',
  validationFailure = 'yup/action/validationFailure',
  validationFailureAsync = 'yup/action/validationFailure/async',
}

const yupSchema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required().positive().integer(),
  email: yup.string().email(),
  website: yup.string().url(),
  createdOn: yup.date().default(function () {
    return new Date();
  }),
});

export type YupSchemaType = {
  name: string;
  age: number;
  email?: string;
  website?: string;
  createdOn?: Date;
};

export const yupAction = createValidatableAction(
  [YupActionTypes.action, YupActionTypes.validationFailure],
  (payload: YupSchemaType) => yupSchema.isValidSync(payload),
);

export const yupActionAsync = createValidatableAction(
  [YupActionTypes.actionAsync, YupActionTypes.validationFailureAsync],
  (payload: YupSchemaType) => yupSchema.isValid(payload),
);

type YupActions =
  | ActionType<typeof yupAction>
  | ActionType<typeof yupAction.onValidationFailureAction>
  | ActionType<typeof yupActionAsync>
  | ActionType<typeof yupActionAsync.onValidationFailureAction>;

type YupState = {
  syncSuccess?: YupSchemaType;
  syncFailure?: boolean;
  asyncSuccess?: YupSchemaType;
  asyncFailure?: boolean;
};

const initialYupState: YupState = {};

export const yupReducer = (state: YupState = initialYupState, action: YupActions): YupState => {
  switch (action.type) {
    case getType(yupAction):
      return {
        ...state,
        syncSuccess: action.payload,
      };
    case getType(yupAction.onValidationFailureAction):
      return {
        ...state,
        syncFailure: action.payload,
      };
    case getType(yupActionAsync):
      return {
        ...state,
        asyncSuccess: action.payload,
      };
    case getType(yupActionAsync.onValidationFailureAction):
      return {
        ...state,
        asyncFailure: action.payload,
      };
    default:
      return state;
  }
};
