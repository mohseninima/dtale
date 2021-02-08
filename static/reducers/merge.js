import { combineReducers } from "redux";

import { chartData } from "./chart";

function instances(state = [], action = {}) {
  switch (action.type) {
    case "load-instances":
      return action.instances;
    default:
      return state;
  }
}

function loading(state = true, action = {}) {
  switch (action.type) {
    case "load-instances":
      return false;
    default:
      return state;
  }
}

export default combineReducers({ chartData, instances, loading });
