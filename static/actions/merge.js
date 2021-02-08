import { fetchJson } from "../fetcher";

function init() {
  return dispatch => {
    dispatch({ type: "init-params" });
    fetchJson("/dtale/processes?dtypes=true", ({ data }) => dispatch({ type: "load-instances", instances: data }));
  };
}

export default { init };
