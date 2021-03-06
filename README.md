# redux-sync-reducer

[![version][npm-badge]][npm]
[![license][license-badge]](LICENSE)
[![Travis][travis-badge]][travis]
[![Coverage][coverage-badge]][coverage]

[npm-badge]: https://img.shields.io/npm/v/redux-sync-reducer.svg?style=flat-square
[license-badge]: https://img.shields.io/github/license/darthmaim/redux-sync-reducer.svg?style=flat-square
[travis-badge]: https://img.shields.io/travis/darthmaim/redux-sync-reducer/master.svg?style=flat-square
[coverage-badge]: https://img.shields.io/codecov/c/github/darthmaim/redux-sync-reducer.svg?style=flat-square
[npm]: https://www.npmjs.com/package/redux-sync-reducer
[travis]: https://travis-ci.org/darthmaim/redux-sync-reducer
[coverage]: https://codecov.io/github/darthmaim/redux-sync-reducer

High order reducer to sync states between tabs.

## Installation

```
npm install --save redux-sync-reducer
```

## Usage

Wrap the reducers you want synced between tabs with `syncedReducer`.

```js
import { syncedReducer } from 'redux-sync-reducer';

syncedReducer(reducer);
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
**name**        | `reducer.toString()` | Pass a custom name for the reducer.<br>See [why you might need this](#when-using-multiple-different-syncedreducers-all-receive-the-same-state).
**skipReducer** | `false` | When the state is changed in another tab, it will call your own reducer with the new value. You can skip this by setting `skipReducer` to `true`.
**skipLoading** | `false` | Do not initialize the state with the last value stored in localStorage.

## Common issues

### When using multiple different `syncedReducers` all receive the same state

You are probably wrapping your reducers in another high order reducer (for example `handleAction` from `redux-actions`) before passing it to `syncedReducer`. `syncedReducer` can't distinguish between the different reducers and you have to set a custom
name when creating it.

```js
export const counter = syncedReducer(handleAction(INCREASE, state => state + 1, { name: 'counter' }));
```

## License

**redux-sync-reducer** is licensed under the [MIT License](LICENSE).
