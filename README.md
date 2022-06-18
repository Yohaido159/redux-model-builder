# redux-model-builder

this package ment to help you to create items in server and update complex state in react redux applications.
this package is used behind the scenes in `saga-axios` package.

## basic usage

### 1. Update the redux store file

`store.js`

```js
import { all , fork } from "redux-saga/effects";
import createSagaMiddleware from "redux-saga";
import { configureStore } from "@reduxjs/toolkit";
import { takeEverySendToProcess } from "saga-axios";

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];

function* rootSaga() {
  yield all([fork(takeEverySendToProcess)]);
}

export const createAppStore = () => {
  
  let store = configureStore({
    reducer: createReducer({}, {
      ['PRODUCTS_ADD_TO_REDUX']: (state, action) => {
        processSetAddToRedux(action, state);
      },
    }),
    middleware: middlewares,
  });

  sagaMiddleware.run(rootSaga);
  return store;
};

export const store = createAppStore();
```

### 1. Create BaseModel file

`baseModel.models.js`

```js
import { BaseModel } from "redux-model-builder";

export const makeBaseModel = (dispatch) => {
  BaseModel.setDispatch = dispatch;
  return BaseModel;
};
```

### 2. Create Model file

`products.models.js`

```js

import { useDispatch } from "react-redux";
import { makeBaseModel } from "./baseModel.models";

export const useModelProducts = (selector_type = "base") => {
  const dispatch = useDispatch();
  const BaseModel = makeBaseModel(dispatch);
  const REDUCER_NAME = 'PRODUCTS_ADD_TO_REDUX'

  class ModelProducts extends BaseModel {
    constructor(props) {
      super();
      this.selector_type = selector_type; // must to be after super() in the first attribute
      this.type = this.makeType({ base_type:  REDUCER_NAME });
      this.url = 'https://localhost:8000/api/products';
      this.base_path = "products";
    }
  }

  const instance = new ModelProducts();
  return instance;
};

export default useModelProducts;
```

### 3. Use the Model for CRUD operations

`products.js`

```js
import useModelProducts from "./products.models";
import { useSelector } from "react-redux";

const Products = (props) => {

const ModelProducts = useModelProducts();

const products = useSelector(ModelProducts.reduxSelectItem({
    config: {
      detail: false
    }
}));

const handleAddProduct = () => {
  ModelProducts.createItem({
    payload: {
      name: "product name",
      price: "product price",
      description: "product description"
    }
  })
}

const handleUpdateProduct = () => {
  ModelProducts.updateItem({
    id: "product id",
    payload: {
      name: "updated product name",
      description: "updated product description"
    }
  })
}

const handleDeleteProduct = () => {
  ModelProducts.deleteItem({
    id: "product id"
  })
}

return (
    <div>
      <button onClick={handleAddProduct}>Add Product</button> 
      <button onClick={handleUpdateProduct}>Update Product</button>
      <button onClick={handleDeleteProduct}>Delete Product</button>

      <h2>All products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
    </div>
  )
}

export default Products
```
