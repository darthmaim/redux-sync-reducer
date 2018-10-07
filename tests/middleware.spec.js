/* eslint-env node, mocha */
import { expect } from 'chai';
import { ActionTypes, syncMiddleware, syncedReducer } from '../src/index';
import { createStore, applyMiddleware } from 'redux';

const context = typeof window !== 'undefined' ? window : global;

let lastEventListener;
context.addEventListener = (event, callback) => {
    lastEventListener = {
        event, callback
    };
};

function buildStore() {
    const store = {
        dispatchedActions: [],

        dispatch(action) {
            store.dispatchedActions.push(action);
        }
    };

    return store;
}

describe('middleware', () => {
    afterEach(() => {
        lastEventListener = undefined;

        localStorage.clear();
        localStorage.itemInsertionCallback = null;
    });

    it('should dispatch init action', () => {
        const store = buildStore();
        syncMiddleware(store);

        expect(store.dispatchedActions).to.have.length(1);
        expect(store.dispatchedActions[0]).to.deep.equal({ type: ActionTypes.INIT });
    });

    it('should be valid middleware', () => {
        const store = buildStore();
        const result = syncMiddleware(store);

        expect(result).to.be.a('function');
        expect(result(a => a)('foo')).to.equal('foo');
    });

    it('should add event listner', () => {
        expect(lastEventListener).to.be.undefined;

        syncMiddleware(buildStore());

        expect(lastEventListener.event).to.equal('storage');
    });

    it('should dispatch update from event listener', () => {
        localStorage.setItem('@@redux-sync-reducer/test', '1');

        const store = buildStore();
        syncMiddleware(store);
        const reducer = syncedReducer(() => {}, { name: 'test', skipLoading: true });

        expect(store.dispatchedActions).to.have.length(1);

        lastEventListener.callback({ key: '@@redux-sync-reducer/test' });

        expect(store.dispatchedActions).to.have.length(2);
        expect(store.dispatchedActions[1]).to.deep.equal({ type: ActionTypes.UPDATE, name: 'test', payload: 1 });
    });

    it('should not dispatch update for non existing reducers', () => {
        const store = buildStore();
        syncMiddleware(store);
        
        expect(store.dispatchedActions).to.have.length(1);

        lastEventListener.callback({ key: '@@redux-sync-reducer/non-existing' });

        expect(store.dispatchedActions).to.have.length(1);
    });

    it('should work with real redux', () => {
        const reducer = () => {};
        const middlewares = applyMiddleware(syncMiddleware);
        const creatingStore = createStore.bind(undefined, reducer, middlewares);

        expect(creatingStore).to.not.throw();
    })
});
