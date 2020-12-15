import { waitFor } from '@testing-library/react';
import createMockReduxStore from './mockStore/createMockReduxStore';
import { iotsAction, IOTSSchemaType } from './mockStore/iotsReducer';
import { jsonAction, JSONSchemaType } from './mockStore/jsonSchemaReducer';
import { yupAction, yupActionAsync, YupSchemaType } from './mockStore/yupReducer';

describe('createValidateActionsMiddleware', () => {
  let store: ReturnType<typeof createMockReduxStore>;
  beforeEach(() => {
    store = createMockReduxStore();
  });
  describe('yup', () => {
    it('sync success', async () => {
      const payload: YupSchemaType = { name: 'valid name', age: 42 };
      store.dispatch(yupAction({ name: 'valid name', age: 42 }));
      await waitFor(() => {
        expect(store.getState().yup.syncSuccess).toEqual(payload);
      });
    });

    it('sync failure', async () => {
      const payload: YupSchemaType = { name: 'valid name', age: -1 };
      store.dispatch(yupAction(payload));
      await waitFor(() => {
        expect(store.getState().yup.syncFailure).toEqual(false);
      });
    });

    it('async success', async () => {
      const payload: YupSchemaType = { name: 'valid name', age: 42 };
      store.dispatch(yupActionAsync(payload));
      await waitFor(() => {
        expect(store.getState().yup.asyncSuccess).toEqual(payload);
      });
    });

    it('async failure', async () => {
      const payload: YupSchemaType = { name: 'valid name', age: -1 };
      store.dispatch(yupActionAsync(payload));
      await waitFor(() => {
        expect(store.getState().yup.asyncFailure).toEqual(false);
      });
    });
  });

  describe('io-ts', () => {
    it('success', async () => {
      const payload: IOTSSchemaType = { name: 'valid name', age: 42 };
      store.dispatch(iotsAction({ name: 'valid name', age: 42 }));
      await waitFor(() => {
        expect(store.getState().iots.decodeSuccess).toEqual(payload);
      });
    });

    it('failure', async () => {
      const payload: IOTSSchemaType = { name: 'valid name' } as IOTSSchemaType;
      store.dispatch(iotsAction(payload));
      await waitFor(() => {
        expect(store.getState().iots.decodeFailure).toEqual({ key: 'age', kind: 'required' });
      });
    });
  });

  describe('json schema', () => {
    it('success', async () => {
      const payload: JSONSchemaType = { name: 'valid name', age: 42 };
      store.dispatch(jsonAction({ name: 'valid name', age: 42 }));
      await waitFor(() => {
        expect(store.getState().jsonSchema.validationSuccess).toEqual(payload);
      });
    });

    it('failure', async () => {
      const payload: JSONSchemaType = { name: 'valid name' } as JSONSchemaType;
      store.dispatch(jsonAction(payload));
      await waitFor(() => {
        expect(store.getState().jsonSchema.validationFailure).toEqual([
          {
            dataPath: '',
            keyword: 'required',
            message: "should have required property 'age'",
            params: { missingProperty: 'age' },
            schemaPath: '#/required',
          },
        ]);
      });
    });
  });
});
