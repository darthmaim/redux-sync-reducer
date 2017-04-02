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
  INIT: '@@redux-sync-reducer/INIT',
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
 * @param {object} data 
 */
function sync(name, data) {
    if(isSupported) {
        localStorage.setItem(getKeyName(name), JSON.stringify(data));
    }

    return data;
}

/**
 * High level reducer to wrap reducers to sync the state between tabs.
 * @param {function} reducer 
 * @param {object} config 
 */
export function syncedReducer(reducer, config = {}) {
    const name = config.name || reducer.toString();
    syncedReducers.push(name);

    let isLoaded = !!config.skipLoading;

    return (state, action = {}, ...slices) => {
        if(action.type === ActionTypes.UPDATE && action.name === name) {
            return config.skipReducer
                ? action.payload
                : reducer(action.payload, action, ...slices);
        }

        if(action.type === ActionTypes.INIT && !isLoaded) {
            isLoaded = true;

            if(isSupported) {
                const initialState = JSON.parse(localStorage.getItem(getKeyName(name)));

                if(initialState) {
                    return config.skipReducer
                        ? initialState
                        : reducer(initialState, action, ...slices);
                } else {
                    return reducer(state, action, ...slices)
                }
            } 
        }

        return isLoaded
            ? sync(name, reducer(state, action, ...slices))
            : reducer(state, action, ...slices);
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

    // load all existing states from localStorage
    store.dispatch({ type: ActionTypes.INIT });

    return next => action => next(action);
}
