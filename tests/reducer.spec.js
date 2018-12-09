/* eslint-env node, mocha */
import { expect } from 'chai';
import { ActionTypes, syncedReducer } from '../src/index';

describe('reducer', () => {
    afterEach(() => {
        localStorage.clear();
        localStorage.itemInsertionCallback = null;
    });

    it('should pass actions to the wrapped reducer', () => {
        const reducer = (state, action) => ({state, action});
        const wrapped = syncedReducer(reducer);

        const action = { type: 'test' };

        const result = wrapped(1, action);

        expect(result.state).to.equal(1);
        expect(result.action).to.equal(action);

        expect(result).to.deep.equal(reducer(1, action));
    });

    it('should pass additional attributes to the wrapped reducer', () => {
        const reducer = (state, action, ...slices) => ({state, action, slices});
        const wrapped = syncedReducer(reducer);

        const action = { type: 'test' };

        const result = wrapped(1, action, 'additional', 'attributes');

        expect(result.slices).to.deep.equal(['additional', 'attributes']);
    });

    describe('should update the state', () => {
        it('and call reducer', () => {
            const reducer = (state, action) => ({state, action});
            const wrapped = syncedReducer(reducer, { name: 'test' });

            const action = { type: ActionTypes.UPDATE, name: 'test', payload: 'new' };

            const result = wrapped('old', action);

            expect(result.state).to.equal('new');
            expect(result.action).to.equal(action);
        });

        it('and skip reducer', () => {
            const reducer = (state, action) => ({state, action});
            const wrapped = syncedReducer(reducer, { name: 'test', skipReducer: true });

            const action = { type: ActionTypes.UPDATE, name: 'test', payload: 'new' };

            const result = wrapped('old', action);

            expect(result).to.equal('new');
        });

        it('if name matches', () => {
            const reducer = (state, action) => ({state, action});
            const wrapped = syncedReducer(reducer, { name: 'test' });

            const action = { type: ActionTypes.UPDATE, name: 'test2', payload: 'new' };

            const result = wrapped('old', action);

            expect(result.state).to.equal('old');
            expect(result.action).to.equal(action);
        });
    });

    it('should sync the state', () => {
        expect(localStorage).to.have.length(0);

        const reducer = (state, action) => state + 1;
        const wrapped = syncedReducer(reducer, { name: 'test', skipLoading: true });

        const action = { type: 'test' };

        const result = wrapped(1, action);

        expect(localStorage).to.have.length(1);
        expect(localStorage.getItem('@@redux-sync-reducer/test')).to.equal('2');
    });

    describe('should load initial state', () => {
        it('on first call', () => {
            localStorage.setItem('@@redux-sync-reducer/test', '1');

            const reducer = (state, action) => state;
            const wrapped = syncedReducer(reducer, { name: 'test' });
            const action = { type: 'test' };

            const result = wrapped(undefined, action);
            
            expect(result).to.equal(1);
        })

        it('and call reducer', () => {
            localStorage.setItem('@@redux-sync-reducer/test', '1');

            const reducer = (state, action) => state + 1;
            const wrapped = syncedReducer(reducer, { name: 'test' });
            const action = { type: 'INCREMENT' };

            const result = wrapped(undefined, action);
            
            expect(result).to.equal(2);
        });

        it('and fallback to reducer', () => {
            const reducer = (state, action) => 'fallback';
            const wrapped = syncedReducer(reducer, { name: 'test', skipReducer: true });
            const action = { type: '@test' };

            const result = wrapped(undefined, action);
            
            expect(result).to.equal('fallback');
        });
    });
});
