import * as D from 'io-ts/Decoder';
import { pipe } from 'fp-ts/lib/function';
import { isRight } from 'fp-ts/Either';
import { ActionType, getType } from 'typesafe-actions';
import createValidatableAction from '../../src/createValidateableAction';

export enum IOTSActionTypes {
  action = 'iots/action',
  validationFailure = 'iots/action/validationFailure',
}

const IOTSSchema = pipe(
  D.type({
    name: D.string,
    age: D.number,
  }),
  D.intersect(
    D.partial({
      email: D.string,
      website: D.string,
    }),
  ),
);

export type IOTSSchemaType = D.TypeOf<typeof IOTSSchema>;
export type ITOSErrorGroup = { value: ITOSErrorType };
export type ITOSErrorType = { key: string; kind: string };

export const iotsAction = createValidatableAction(
  [IOTSActionTypes.action, IOTSActionTypes.validationFailure],
  (payload: IOTSSchemaType) =>
    pipe(IOTSSchema.decode(payload), (res) =>
      isRight(res)
        ? true
        : {
            key: (res.left as ITOSErrorGroup).value.key,
            kind: (res.left as ITOSErrorGroup).value.kind,
          },
    ),
);

type IOTSActions =
  | ActionType<typeof iotsAction>
  | ActionType<typeof iotsAction.onValidationFailureAction>;

type IOTSState = {
  decodeSuccess?: IOTSSchemaType;
  decodeFailure?: ITOSErrorType;
};

const IOTSState: IOTSState = {};

export const iotsReducer = (state: IOTSState = IOTSState, action: IOTSActions): IOTSState => {
  switch (action.type) {
    case getType(iotsAction):
      return {
        ...state,
        decodeSuccess: action.payload,
      };
    case getType(iotsAction.onValidationFailureAction):
      return {
        ...state,
        decodeFailure: action.payload,
      };
    default:
      return state;
  }
};
