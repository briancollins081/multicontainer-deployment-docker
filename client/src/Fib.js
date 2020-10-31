import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
  state = {
    seenIdexes: [],
    values: [],
    index: "",
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  fetchValues = async () => {
    const values = await axios.get("/api/values/current");
    console.log({ values });
    this.setState({ values: values.data });
  };

  fetchIndexes = async () => {
    const seenIndices = await axios.get("/api/values/all");
    console.log({ seenIndices });
    this.setState({ seenIdexes: seenIndices.data });
  };
  renderSeenIndexes = () =>
    this.state.seenIdexes.map(({ number }) => number).join(",");

  renderValues = () => {
    const entries = [];
    for (const key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }
    return entries;
  };
  handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/api/values", {
      index: this.state.index,
    });
    this.setState({ index: "" });
  };
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="index">Enter your index:</label>
          <input
            id="index"
            type="text"
            value={this.state.index}
            onChange={(e) => this.setState({ index: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}
        <h3>Calculated values:</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
