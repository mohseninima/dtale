import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import Select, { createFilter } from "react-select";

import { BouncerWrapper } from "../../BouncerWrapper";
import ButtonToggle from "../../ButtonToggle";
import { openChart } from "../../actions/charts";
import menuFuncs from "../../dtale/menu/dataViewerMenuUtils";
import { Popup } from "../../popups/Popup";

require("./MergeDatasets.scss");

const ACTIONS = [
  { label: "Merge", value: "merge" },
  { label: "Join", value: "join" },
  { label: "Concatenate", value: "concat" },
];

const newDataset = props => ({
  dataId: null,
  columns: null,
  index: null,
  isOpen: false,
  ...props,
});
function datasetName(instance, missing = "") {
  if (instance) {
    return `${instance.data_id}${instance.name ? ` - ${instance.name}` : ""}`;
  }
  return missing;
}

export class ReactMergeDatasets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datasets: [newDataset({ isOpen: true })],
      action: "merge",
    };
    this.updateDataset = this.updateDataset.bind(this);
    this.removeDataset = this.removeDataset.bind(this);
    this.addDataset = this.addDataset.bind(this);
    this.toggleDatasets = this.toggleDatasets.bind(this);
    this.renderDatasetInputs = this.renderDatasetInputs.bind(this);
  }

  updateDataset(props, index) {
    const datasets = [...this.state.datasets];
    datasets[index] = { ...datasets[index], ...props };
    this.setState({ datasets });
  }

  removeDataset(index) {
    const datasets = _.reject(this.state.datasets, (_, i) => i === index);
    if (datasets.length == 1) {
      datasets[0].isOpen = true;
    }
    this.setState({ datasets });
  }

  addDataset() {
    this.setState({ datasets: [...this.state.datasets, newDataset()] });
  }

  toggleDatasets(index) {
    this.setState({
      datasets: _.map(this.state.datasets, (d, i) => ({
        ...d,
        isOpen: i === index,
      })),
    });
  }

  renderDatasetInputs(dataset, datasetIndex) {
    const { instances } = this.props;
    const { dataId } = dataset;
    const instance = dataId ? _.find(instances, { data_id: dataId.value }) : undefined;
    const columns = instance ? _.sortBy(instance.names, "name") : null;
    return (
      <dl key={datasetIndex} className="dataset accordion pt-3">
        <dt
          className={`dataset accordion-title${dataset.isOpen ? " is-expanded" : ""} pointer pl-3`}
          onClick={() => this.toggleDatasets(datasetIndex)}>
          {datasetName(instance, "No Dataset Selected")}
        </dt>
        <dd className={`p-0 dataset accordion-content${dataset.isOpen ? " is-expanded" : ""}`}>
          <div className="row pt-4">
            <div className="col-md-6">
              <div className="form-group row">
                <label className="col-md-2 col-form-label text-right">Dataset*</label>
                <div className="col-md-8">
                  <div className="input-group">
                    <Select
                      className="Select is-searchable Select--single"
                      classNamePrefix="Select"
                      options={_.map(_.sortBy(instances, "data_id"), p => ({
                        value: p.data_id,
                        label: datasetName(p),
                      }))}
                      getOptionLabel={_.property("label")}
                      getOptionValue={_.property("value")}
                      value={dataset.dataId}
                      onChange={dataId => this.updateDataset({ dataId }, datasetIndex)}
                      filterOption={createFilter({ ignoreAccents: false })}
                      noOptionsMessage={() => `No datasets available!`}
                    />
                  </div>
                </div>
              </div>
              {instance && (
                <React.Fragment>
                  <div className="form-group row">
                    <label className="col-md-2 col-form-label text-right">Index(es)*</label>
                    <div className="col-md-8">
                      <div className="input-group">
                        <Select
                          isMulti
                          className="Select is-clearable is-searchable Select--single"
                          classNamePrefix="Select"
                          options={columns}
                          getOptionLabel={col => `${col.name} (${col.dtype})`}
                          getOptionValue={_.property("name")}
                          value={dataset.index}
                          onChange={index => this.updateDataset({ index }, datasetIndex)}
                          filterOption={createFilter({ ignoreAccents: false })}
                          placeholder="Select Indexes"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-md-2 col-form-label text-right">Column(s)</label>
                    <div className="col-md-8">
                      <div className="input-group">
                        <Select
                          isMulti
                          className="Select is-clearable is-searchable Select--single"
                          classNamePrefix="Select"
                          options={columns}
                          getOptionLabel={col => `${col.name} (${col.dtype})`}
                          getOptionValue={_.property("name")}
                          value={dataset.columns}
                          onChange={columns => this.updateDataset({ columns }, datasetIndex)}
                          isClearable
                          filterOption={createFilter({ ignoreAccents: false })}
                          placeholder="All Columns Selected"
                        />
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )}
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col" />
                <div className="col-auto">
                  <button className="btn-sm btn-primary mr-5 pointer" onClick={() => this.removeDataset(datasetIndex)}>
                    <i className="ico-remove-circle pr-3" />
                    <span>Remove Dataset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </dd>
      </dl>
    );
  }

  render() {
    const buttonHandlers = menuFuncs.buildHotkeyHandlers(this.props);
    const { openPopup } = buttonHandlers;
    return (
      <React.Fragment>
        <div className="row pt-3">
          <div className="col-auto">
            <ButtonToggle
              options={ACTIONS}
              update={action => this.setState({ action })}
              defaultValue={this.state.action}
            />
          </div>
          <div className="col" />
          <div className="col-auto">
            <button className="btn-sm btn-primary mr-5 pointer" onClick={openPopup("upload", 450)}>
              <i className="ico-file-upload pr-3" />
              <span>Upload</span>
            </button>
          </div>
        </div>
        <BouncerWrapper showBouncer={this.props.loading}>
          {!this.props.loading && (
            <div className="row p-4">
              <div className="col-md-12">{_.map(this.state.datasets, this.renderDatasetInputs)}</div>
            </div>
          )}
          <div className="row p-4">
            <div className="col-auto">
              <button className="btn-sm btn-primary pointer" onClick={this.addDataset}>
                <i className="ico-add-circle pr-3" />
                <span>Add Dataset</span>
              </button>
            </div>
          </div>
        </BouncerWrapper>
        <Popup propagateState={(_state, callback) => callback()} dataId="1" />
      </React.Fragment>
    );
  }
}
ReactMergeDatasets.displayName = "ReactMergeDatasets";
ReactMergeDatasets.propTypes = {
  instances: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  openChart: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
};

export default connect(
  ({ instances, loading }) => ({ instances, loading }),
  dispatch => ({ openChart: chartProps => dispatch(openChart(chartProps)) })
)(ReactMergeDatasets);
