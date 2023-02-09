import React from "react";

// reactstrap components
import {
  Nav, NavLink, NavItem, Table
} from 'reactstrap';

// core components
import Navbar from "./Navbars/Navbar.js";

// index page sections
import MainMenu from "./Menu/Menu.js";
//Loader
import { css } from "@emotion/core";
import FadeLoader from "react-spinners/FadeLoader";

import { fetchUsers } from '../helpers/fetch.js';

// CSS - Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
const DEBUG = (process.env.REACT_APP_DEBUG_LOG === "true") ? true : false;

const COMPLETED_SESSION = "c"
const PARTIAL_COMPLETED_SESSION = "p"
export default class BargainResult extends React.Component {
  state = {
    users: [],
    usersPartial: [],
    loading: false
  }

  componentDidMount() {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    this.refs.main.scrollTop = 0;

    this.setState({ loading: true }); //Show Loading

    // this.verifyToken(this.props.location.search);

    fetchUsers(this._onLoadUsersCallBack.bind(this))
  }

  /**
 * Once users have been loaded from the spreadsheet
 */
  _onLoadUsersCallBack(data, error) {
    if (data) {
      this.setState({
        users: data.users,
        usersPartial: data.usersPartial,
        loading: false, //Hide loading
      })
      if (DEBUG) console.log(this.state)
    } else {
      this.setState({
        error: error
      })
    }
  }

  render() {
    return (
      <>
        <Navbar />
        <main ref="main">
          <MainMenu />
        </main>
        <div style={{ position: "fixed", top: "35%", left: "48%" }}>
          <FadeLoader
            css={override}
            size={50}
            color={"#123abc"}
            loading={this.state.loading}
          />
        </div>
        <div style={{ padding: '2em' }}>
          <h5>All user results</h5>
          {getTableAllUsers()}
          <br /><br />

          <h5>Finished sessions</h5>
          {getTable(this.state.users, COMPLETED_SESSION)}
          <br /><br />

          <h5>Partial sessions</h5>
          {getTable(this.state.usersPartial, PARTIAL_COMPLETED_SESSION)}
          <br /><br />
          <h5>Participants count <h6><NavLink href={"https://api.swps-pjatk-experiment.co/v3/participants-count-result"}>Download</NavLink></h6></h5>
          <br /><br />
        </div>
      </>
    );
  }
}

function getTable(users, resultsType) {
  return (
    <Table responsive bordered size="sm">
      <thead>
        <tr>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Sessions</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Timestamp</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Bargain results</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Bargain results per store</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Survey results</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Demographic results</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Memory task results</th>
        </tr>
      </thead>
      <tbody>
        {getTableBody(users, resultsType)}
      </tbody>
    </Table>
  );
}

function getTableAllUsers() {
  return (
    <Table responsive bordered size="sm">
      <thead>
        <tr>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}></th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Bargain results</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Bargain results per store</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Survey results</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Demographic results</th>
          <th className="align-middle" style={{ textAlign: 'center', padding: '7px' }}>Memory task results</th>
        </tr>
      </thead>
      <tbody>
        {getAllUsersBody(COMPLETED_SESSION)}
        {getAllUsersBody(PARTIAL_COMPLETED_SESSION)}
      </tbody>
    </Table>
  );
}

function getAllUsersBody(resultsType) {
  return <tr style={{ textAlign: '-webkit-center' }}>
    <td style={{ textAlign: "-moz-center" }}>
      {resultsType === COMPLETED_SESSION ? "Finished sessions" : "Partial sessions"}
    </td>
    <td style={{ textAlign: "-moz-center" }}>
      <NavLink href={"https://api.swps-pjatk-experiment.co/v3/bargains-result/" + resultsType}>Download</NavLink>
    </td>
    <td style={{ textAlign: "-moz-center" }}>
      <NavLink href={"https://api.swps-pjatk-experiment.co/v3/bargains-result-per-store/" + resultsType}>Download</NavLink>
    </td>
    <td style={{ textAlign: "-moz-center" }}>
      <NavLink href={"https://api.swps-pjatk-experiment.co/v3/survey-result/" + resultsType}>Download</NavLink>
    </td>
    <td style={{ textAlign: "-moz-center" }}>
      <NavLink href={"https://api.swps-pjatk-experiment.co/v3/demographic-result/" + resultsType}>Download</NavLink>
    </td>
    <td style={{ textAlign: "-moz-center" }}>
      <NavLink href={"https://api.swps-pjatk-experiment.co/v3/memory-result/" + resultsType}>Download</NavLink>
    </td>
  </tr>
}

function getTableBody(users, resultsType) {
  let body = []
  for (let i = 0; i < users.length; i++) {
    let timestamp = new Date(Date.parse(users[i].created_at)).toLocaleString()

    body.push(
      <tr style={{ textAlign: '-webkit-center' }}>
        <td style={{ textAlign: "-moz-center" }}>
          {users[i].user_id}
        </td>
        <td style={{ textAlign: "-moz-center" }}>
          {timestamp}
        </td>
        <td style={{ textAlign: "-moz-center" }}>
          <NavLink href={"https://api.swps-pjatk-experiment.co/v3/bargains-result/" + resultsType + "/" + users[i].user_id}>Download</NavLink>
        </td>
        <td style={{ textAlign: "-moz-center" }}>
          <NavLink href={"https://api.swps-pjatk-experiment.co/v3/bargains-result-per-store/" + resultsType + "/" + users[i].user_id}>Download</NavLink>
        </td>
        <td style={{ textAlign: "-moz-center" }}>
          <NavLink href={"https://api.swps-pjatk-experiment.co/v3/survey-result/" + resultsType + "/" + users[i].user_id}>Download</NavLink>
        </td>
        <td style={{ textAlign: "-moz-center" }}>
          <NavLink href={"https://api.swps-pjatk-experiment.co/v3/demographic-result/" + resultsType + "/" + users[i].user_id}>Download</NavLink>
        </td>
        <td style={{ textAlign: "-moz-center" }}>
          <NavLink href={"https://api.swps-pjatk-experiment.co/v3/memory-result/" + resultsType + "/" + users[i].user_id}>Download</NavLink>
        </td>
      </tr>
    )
  }

  return body;
}