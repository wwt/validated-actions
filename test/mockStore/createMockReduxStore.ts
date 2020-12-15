import { createStore, combineReducers, applyMiddleware } from 'redux';
import createValidateActionsMiddleware from '../../src/createValidateActionsMiddleware';
import { iotsReducer } from './iotsReducer';
import { jsonSchemaReducer } from './jsonSchemaReducer';
import { yupReducer } from './yupReducer';

const rootReducer = combineReducers({
  yup: yupReducer,
  iots: iotsReducer,
  jsonSchema: jsonSchemaReducer,
});

const middlewareEnhancer = applyMiddleware(createValidateActionsMiddleware());

export default () => createStore(rootReducer, undefined, middlewareEnhancer);
