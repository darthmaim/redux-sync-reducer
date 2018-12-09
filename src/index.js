const context = typeof window !== 'undefined' ? window : global

const localStorage = context.localStorage;

/** 
 * Checks if localStorage is supported.
 * @constant
 * @type {Boolean}
 */
const isSupported = !!(localStorage);

/**
 * List of all reducer names that are synced.
 * @type {string[]}
 */
const syncedReducers = [];

/**
 * Used action types.
 * @readonly
 * @enum {string}
 */
export const ActionTypes = {
  UPDATE: '@@redux-sync-reducer/UPDATE',
}

/**
 * Get the key used in localStorage.
 */
function getKeyName(name) {
    return `@@redux-sync-reducer/${name}`;
}

/**
 * Sync data between tabs.
 * @param {string} name 
 * @param {object} prev
 * @param {object} next 
 */
function sync(name, prev, next) {
    if(isSupported && prev !== next) {
        localStorage.setItem(getKeyName(name), JSON.stringify(next));
    }

    return next;
}

/**
 * High level reducer to wrap reducers to sync the state between tabs.
 * @param {function} reducer 
 * @param {object} config 
 */
export function syncedReducer(reducer, config = {}) {
    const name = config.name || reducer.toString();
    syncedReducers.push(name);

    return (state, action = {}, ...slices) => {
        if(action.type === ActionTypes.UPDATE && action.name === name) {
            return config.skipReducer
                ? action.payload
                : reducer(action.payload, action, ...slices);
        }

        if(state === undefined && !config.skipLoading) {
            if(isSupported) {
                const initialState = JSON.parse(localStorage.getItem(getKeyName(name)));

                // we don't need to sync here, because other reducers also fallback
                return reducer(initialState || state, action, ...slices);
            }
        }
        
        return sync(name, state, reducer(state, action, ...slices));
    }
}

/**
 * Registers storage event listener and dispatches actions when the state gets changed in different tabs.
 */
export const syncMiddleware = store => {
    isSupported && context.addEventListener('storage', e => {
        syncedReducers.some(name => {
            if(e.key === getKeyName(name)) {
                // don't use e.newValue because it doesn't work in IE
                const payload = JSON.parse(localStorage.getItem(e.key));

                store.dispatch({
                    type: ActionTypes.UPDATE,
                    payload,
                    name
                });

                return true;
            }

            return false;
        })
    });

    return next => action => next(action);
}
