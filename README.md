# redux-sync-reducer

High order reducer to sync states between tabs.

## Installation

```
npm install --save redux-sync-reducer
```

## Usage

Wrap the reducers you want synced between tabs with `syncedReducer`.

```js
import { syncedReducer } from 'redux-sync-reducer';

syncedReduer(reducer);
```

You also need to add the `syncMiddleware` when creating your store. 
This middleware will dispatch actions when the synced state gets changed in another tab.

```js
import { syncMiddleware } from 'redux-sync-reducer';

const store = createStore(reducers, applyMiddleware(syncMiddleware));
```

## API

```js
import { syncedReducer } from 'redux-sync-reducer';
syncedReducer(reducer)
syncedReducer(reducer, config)
```

## Config

You can pass a config object to `syncedReducer`.

option          | default     | description
--------------- | ----------- | ------------
**name**        | `reducer.toString()` | Pass a custom name for the reducer.<br>See [why you might need this](#When-using-multiple-different-syncedReducers-all-receive-the-same-state).
**skipReducer** | `false` | When the internal action is dispatched, it will call your own reducer with the new value. You can skip this by setting `skipReducer` to `true`.

## Common issues

### When using multiple different `syncedReducers` all receive the same state

You are probably wrapping your reducers in another high order reducer (for example `handleAction` from `redux-actions`) before passing it to `syncedReducer`. `syncedReducer` can't distinguish between the different reducers and you have to set a custom
name when creating it.

```js
export const counter = syncedReducer(handleAction(INCREASE, state => state + 1, { name: 'counter' }));
```

## License

**redux-sync-reducer** is licensed under the [MIT License](LICENSE).
