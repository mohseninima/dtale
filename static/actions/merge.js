import _ from "lodash";
import $ from "jquery";

import { fetchJson } from "../fetcher";
import menuFuncs from "../dtale/menu/dataViewerMenuUtils";

function init() {
  return dispatch => {
    dispatch({ type: "init-params" });
    fetchJson("/dtale/processes?dtypes=true", ({ data }) => dispatch({ type: "load-instances", instances: data }));
  };
}

function updateActionType(action) {
  return dispatch => dispatch({ type: "update-action-type", action });
}

function updateActionConfig(actionUpdates) {
  return dispatch => dispatch({ type: "update-action-config", ...actionUpdates });
}

function buildMerge(name) {
  return (_dispatch, getState) => {
    const { action, mergeConfig, stackConfig, datasets } = getState();
    const handleResponse = _.noop;
    $.ajax({
      type: "POST",
      url: menuFuncs.fullPath("/dtale/merge"),
      data: { action, config: action === "merge" ? mergeConfig : stackConfig, datasets, name },
      contentType: false,
      processData: false,
      success: handleResponse,
      error: handleResponse,
    });
  };
}

export default { init, updateActionType, updateActionConfig, buildMerge };
