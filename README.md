# redux-model-builder

this package ment to help you to create items in server and update complex state in react redux applications.
this package is used behind the scenes in `saga-axios` package.

## basic usage

### 1. Update the redux store file

`store.js`

```js
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { all , fork } from "redux-saga/effects";
import { takeEverySendToProcess } from "saga-axios";
import { processSetAddToRedux } from "redux-model-builder"; 

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];

function* rootSaga() {
  yield all([fork(takeEverySendToProcess)]);
}

export const createAppStore = () => {
  
  const store = configureStore({
    reducer: combineReducers({
      products_reducer: createReducer({}, {
        ['PRODUCTS_ADD_TO_REDUX']: (state, action) => {
          processSetAddToRedux(action, state);
        },
      })
    }),
    middleware: middlewares,
  });

  sagaMiddleware.run(rootSaga);
  return store;
};

export const store = createAppStore();
```

### 2. Create BaseModel file

`baseModel.models.js`

```js
import { BaseModel } from "redux-model-builder";

export const makeBaseModel = (dispatch) => {
  BaseModel.setDispatch = dispatch;
  return BaseModel;
};
```

### 3. Create Model file

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
      this.type = REDUCER_NAME 
      this.url = 'https://localhost:8000/api/products';
      this.base_path = "products";
      this.reducer_name = "products_reducer";
      this.is_singular = false // default
    }
  }

  const instance = new ModelProducts();
  return instance;
};

export default useModelProducts;
```

### 4. Use the Model for CRUD operations

`products.js`

```js
import useModelProducts from "./products.models";
import { useSelector } from "react-redux";

const Products = (props) => {

const ModelProducts = useModelProducts();

const products = useSelector(ModelProducts.selectAll());
const productId5 = useSelector(ModelProducts.selectGetById({
    id: 5
}));
const productId5Name = useSelector(ModelProducts.selectField({
    id: 5,
    field_name: "name"
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
      </ul>
      <br/> 
      <h2>Product id 5</h2>
      <ul>
        <li>{productId5.name}</li>
        <li>{productId5.price}</li>
        <li>{productId5.description}</li>
      </ul>
      <br/>
      <h2>Product id 5 name</h2>
      <ul>
        <li>{productId5Name}</li>
      </ul>
    </div>
  )
}

export default Products
```

## Overall capabilities

### 1. Change the state

```mermaid
flowchart    
Model  -->| createItem<br/> retrieveItem<br/> updateItem<br/> deleteItem | RunActionsBefore
RunActionsBefore --> MakeRequestGetResponse -->|Process Response| RunActionsAfter 
RunActionsAfter -->|reduxCreateItem<br/> reduxRetrieveItem<br/> reduxUpdateItem<br/> reduxDeleteItem| UpdateState 
Model  -->|reduxCreateItem<br/> reduxRetrieveItem<br/> reduxUpdateItem<br/> reduxDeleteItem| UpdateState
```

### 2. Select the state
```mermaid
flowchart    
Model  -->| selectAll<br/> selectGetById<br/> selectField<br/>| selectFromState --> cacheSelector
```