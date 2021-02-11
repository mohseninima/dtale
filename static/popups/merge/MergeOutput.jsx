import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import actions from "../../actions/merge";

function buildCode({ action, datasets, mergeConfig, stackConfig }, name) {
  let code = ["import dtale", "from dtale.views import startup\n"];
  const buildIdx = (action, index) =>
    action === "merge" ? `.setIndex([${_.join(_.map(index, "value"), "','")}])` : "";

  _.forEach(datasets, ({ dataId, columns, index }, i) => {
    let cols = [];
    if (action === "merge" && (columns || index)) {
      cols = _.sortBy(_.uniq(_.concat(_.map(columns, "value"), _.map(index, "value"))), c => _.toLower(c));
    } else if (action === "stack") {
      cols = _.sortBy(_.map(columns, "value"), c => _.toLower(c));
    }
    const colStr = cols.length ? `[['${_.join(cols, "','")}']]` : "";
    code.push(`df${i + 1} = dtale.get_instance('${dataId}')${colStr}${buildIdx(action, index)}`);
  });

  if (action === "merge") {
    const { how, sort, indicator } = mergeConfig;
    const buildMerge = (df1, df2, left, right, idx) => {
      let suffixes = "";
      if (left.suffix || right.suffix) {
        const suffixStr = suffix => (suffix ? `'${suffix}` : "None");
        suffixes = `, suffixes=[${suffixStr(left.suffix)},${suffixStr(right.suffix)}]`;
      }
      let cmd = `final_df = ${df1}.merge(${df2}, how='${how}', left_index=True, right_index=True`;
      const sortParam = sort ? `, sort=True` : "";
      const indicatorParam = indicator ? `, indicator='merge_${idx}'` : "";
      cmd += `${sortParam}${indicatorParam}${suffixes})`;
      return cmd;
    };
    code.push(buildMerge("df1", "df2", datasets[0], datasets[1]));
    if (datasets.length > 2) {
      code = _.concat(
        code,
        _.map(_.slice(datasets, 2), (d, i) => buildMerge("final_df", `df${i + 3}`, {}, d, i + 2))
      );
    }
  } else if (action === "stack") {
    const { ignoreIndex } = stackConfig;
    const ignoreIndexParam = ignoreIndex ? `, ignore_index=True` : "";
    code.push(
      `final_df = pd.concat([${_.join(
        _.map(datasets, (_, i) => `df${i + 1}`),
        ","
      )}]${ignoreIndexParam})`
    );
  }
  code.push(`startup(final_df${name ? `, name='${name}'` : ""})`);
  return code;
}

export class ReactMergeOutput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name: "" };
  }

  render() {
    return (
      <div className="row p-4 ml-0 mr-0">
        <div className="col-md-12 p-0">
          <div className="form-group row">
            <label className="col-form-label text-right">Dataset Name:</label>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                value={this.state.name}
                onChange={e => this.setState({ name: e.target.value })}
              />
            </div>
            <div className="col" />
            <div className="col-auto">
              <button className="btn-sm btn-primary pointer" onClick={() => this.props.buildMerge(this.state.name)}>
                <i className="ico-remove-circle pr-3" />
                <span>{`Build ${_.capitalize(this.props.action)}`}</span>
              </button>
            </div>
          </div>
          <h3>Code</h3>
          <SyntaxHighlighter language="python" style={docco}>
            {_.join(buildCode(this.props, this.state.name), "\n")}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}
ReactMergeOutput.displayName = "ReactMergeOutput";
ReactMergeOutput.propTypes = {
  action: PropTypes.string,
  buildMerge: PropTypes.func,
};

export default connect(
  ({ instances, action, datasets }) => ({ instances, action, datasets }),
  dispatch => ({ buildMerge: name => dispatch(actions.buildMerge(name)) })
)(ReactMergeOutput);
