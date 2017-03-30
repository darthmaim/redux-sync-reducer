/** 
 * Checks if localStorage is supported.
 * @constant
 * @type {Boolean}
 */
const isSupported = !!(window && window.localStorage);

/**
 * List of all reducer names that are synced.
 * @type {string[]}
 */
const syncedReducers = [];


/**
 * Get the type of the action.
 * @param {string} name 
 */
function getActionType(name) {
    return `@@sync-reducer/sync/${name}`;
}

/**
 * Get the key used in localStorage.
 */
function getKeyName(name) {
    return `@@sync-reducer/${name}`;
}

/**
 * Sync data between tabs.
 * @param {string} name 
 * @param {object} data 
 */
function sync(name, data) {
    if(isSupported) {
        window.localStorage.setItem(getKeyName(name), JSON.stringify(data));
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
    const actionType = getActionType(name);

    syncedReducers.push(name);

    return (state, action = {}, ...slices) => {
        switch(action.type) {
            case actionType:
                return config.skipReducer ? action.payload : reducer(action.payload, action, ...slices);
            default:
                return sync(name, reducer(state, action, ...slices));
        }
    }
}

/**
 * Registers storage event listener and dispatches actions when the state gets changed in different tabs.
 */
export const syncMiddleware = store => {
    isSupported && window.addEventListener('storage', e => {
        syncedReducers.some(name => {
            if(e.key === getKeyName(name)) {
                store.dispatch({
                    type: getActionType(name),
                    payload: JSON.parse(e.newValue)
                });

                return true;
            }

            return false;
        })
    });

    return next => action => next(action);
}