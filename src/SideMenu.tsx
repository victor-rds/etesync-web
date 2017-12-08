import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import ActionCode from 'material-ui/svg-icons/action/code';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionBugReport from 'material-ui/svg-icons/action/bug-report';
import ActionQuestionAnswer from 'material-ui/svg-icons/action/question-answer';
import LogoutIcon from 'material-ui/svg-icons/action/power-settings-new';

const logo = require('./images/logo.svg');

import SideMenuJournals from './SideMenuJournals';

import { routeResolver, getPalette } from './App';

import { store, logout, JournalsType, StoreState, CredentialsData } from './store';

import * as C from './Constants';

interface PropsType {
  etesync: CredentialsData | null;
  onCloseDrawerRequest: () => void;
}

interface PropsTypeInner extends PropsType {
  journals: JournalsType;
  history: any;
}

class SideMenu extends React.Component {
  props: PropsTypeInner;

  constructor(props: any) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    store.dispatch(logout());
    this.props.onCloseDrawerRequest();
  }

  render() {
    const username = (this.props.etesync && this.props.etesync.credentials.email) ?
      this.props.etesync.credentials.email
      : C.appName;

    let loggedInItems;
    if (this.props.etesync) {
      const journals = (this.props.journals && this.props.journals.value) && (
        <React.Fragment>
          <Divider />
          <Subheader>Journals</Subheader>
          <SideMenuJournals
            etesync={this.props.etesync}
            journals={this.props.journals.value}
            onItemClick={(journalUid: string) => {
              this.props.onCloseDrawerRequest();
              this.props.history.push(routeResolver.getRoute('journals._id', { journalUid: journalUid }));
            }}
          />
        </React.Fragment>
      );

      loggedInItems = (
        <React.Fragment>
          <ListItem primaryText="Log Out" leftIcon={<LogoutIcon/>}  onClick={this.logout} />
          {journals}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <div className="App-drawer-header">
          <img className="App-drawer-logo" src={logo} />
          <div style={{color: getPalette('alternateTextColor')}} >
            {username}
          </div>
        </div>
        <List>
          <ListItem
            primaryText="Main"
            leftIcon={<ActionHome />}
            onClick={() => {
              this.props.onCloseDrawerRequest();
              this.props.history.push(routeResolver.getRoute('home'));
            }}
          />
          {loggedInItems}
          <Divider />
          <Subheader>External Links</Subheader>
          <ListItem primaryText="Website" leftIcon={<ActionHome />} href={C.homePage} />
          <ListItem primaryText="FAQ" leftIcon={<ActionQuestionAnswer />} href={C.faq} />
          <ListItem primaryText="Source Code" leftIcon={<ActionCode />} href={C.sourceCode} />
          <ListItem primaryText="Report Issue" leftIcon={<ActionBugReport />} href={C.reportIssue} />
        </List>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: StoreState, props: PropsType) => {
  return {
    journals: state.cache.journals,
  };
};

export default withRouter(connect(
  mapStateToProps
)(SideMenu));