# redux-model-builder

this package ment to help you to update complex state in react redux applications.

## quick setup

1. `baseModel.js`
```
import { BaseModel } from "redux-model-builder";
export const makeBaseModel = (dispatch) => {
  BaseModel.setDispatch = dispatch;
  BaseModel.setBaseSelector = baseSelector;
  BaseModel.makeActionsBefore = ({ options, config }) => [
     ...
  ]  ;
  BaseModel.makeActions = ({ options, config }) => [
   ...
  ];

  return BaseModel;
};
```
