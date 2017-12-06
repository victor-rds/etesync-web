import * as React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';

import JournalList from './JournalList';
import JournalView from './JournalView';
import JournalFetcher from './JournalFetcher';

import { routeResolver, getPalette } from './App';
import { store, StoreState, CredentialsType, CredentialsData, fetchCredentials } from './store';

import * as C from './Constants';

interface FormErrors {
  errorEmail?: string;
  errorPassword?: string;
  errorEncryptionPassword?: string;
  errorServer?: string;
}

class EteSyncContext extends React.Component {
  state: {
    showAdvanced?: boolean;
    errors: FormErrors;

    server: string;
    username: string;
    password: string;
    encryptionPassword: string;
  };

  props: {
    credentials: CredentialsType;
  };

  constructor(props: any) {
    super(props);
    this.state = {
      errors: {},
      server: '',
      username: '',
      password: '',
      encryptionPassword: '',
    };
    this.generateEncryption = this.generateEncryption.bind(this);
    this.toggleAdvancedSettings = this.toggleAdvancedSettings.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event: any) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({
      [name]: value
    });
  }

  generateEncryption(e: any) {
    e.preventDefault();
    const server = this.state.showAdvanced ? this.state.server : C.serviceApiBase;

    const username = this.state.username;
    const password = this.state.password;
    const encryptionPassword = this.state.encryptionPassword;

    let errors: FormErrors = {};
    const fieldRequired = 'This field is required!';
    if (!username) {
      errors.errorEmail = fieldRequired;
    }
    if (!password) {
      errors.errorPassword = fieldRequired;
    }
    if (!encryptionPassword) {
      errors.errorEncryptionPassword = fieldRequired;
    }
    if (Object.keys(errors).length) {
      this.setState({errors: errors});
      return;
    }

    this.setState({password: '', encryptionPassword: ''});

    store.dispatch(fetchCredentials(username, password, encryptionPassword, server));
  }

  toggleAdvancedSettings() {
    this.setState({showAdvanced: !this.state.showAdvanced});
  }

  render() {
    if (this.props.credentials.fetching) {
      return (<div>Loading</div>);
    } else if (this.props.credentials.value === null) {
      let advancedSettings = null;
      if (this.state.showAdvanced) {
        advancedSettings = (
            <div>
              <TextField
                type="url"
                errorText={this.state.errors.errorServer}
                floatingLabelText="Server"
                name="server"
                value={this.state.server}
                onChange={this.handleInputChange}
              />
              <br />
            </div>
        );
      }

      const styles = {
        holder: {
          margin: 'auto',
          maxWidth: 400,
          padding: 20,
        },
        paper: {
          padding: 20,
        },
        form: {
        },
        forgotPassword: {
          color: getPalette('accent1Color'),
          paddingTop: 20,
        },
        advancedSettings: {
          marginTop: 20,
        },
        submit: {
          marginTop: 40,
          textAlign: 'right',
        },
      };

      return (
        <div style={styles.holder}>
          <Paper zDepth={2} style={styles.paper}>
            {(this.props.credentials.error) && (<div>Error! {this.props.credentials.error.message}</div>)}
            <h2>Please Log In</h2>
            <form style={styles.form} onSubmit={this.generateEncryption}>
              <TextField
                type="email"
                errorText={this.state.errors.errorEmail}
                floatingLabelText="Email"
                name="username"
                value={this.state.username}
                onChange={this.handleInputChange}
              />
              <TextField
                type="password"
                errorText={this.state.errors.errorPassword}
                floatingLabelText="Password"
                name="password"
                value={this.state.password}
                onChange={this.handleInputChange}
              />
              <div style={styles.forgotPassword}>
                <a href={C.forgotPassword}>Forgot password?</a>
              </div>
              <TextField
                type="password"
                errorText={this.state.errors.errorEncryptionPassword}
                floatingLabelText="Encryption Password"
                name="encryptionPassword"
                value={this.state.encryptionPassword}
                onChange={this.handleInputChange}
              />
              <Toggle
                label="Advanced settings"
                style={styles.advancedSettings}
                toggled={this.state.showAdvanced}
                onToggle={this.toggleAdvancedSettings}
              />
              {advancedSettings}
              <div style={styles.submit}>
                <RaisedButton type="submit" label="Log In" secondary={true} />
              </div>
            </form>
          </Paper>
        </div>
      );
    }

    let context = this.props.credentials.value as CredentialsData;

    return (
      <JournalFetcher etesync={context}>
        <Switch>
          <Route
            path={routeResolver.getRoute('home')}
            exact={true}
            render={() => <Redirect to={routeResolver.getRoute('journals')} />}
          />
          <Route
            path={routeResolver.getRoute('journals')}
            exact={true}
            render={() => <JournalList etesync={context} />}
          />
          <Route
            path={routeResolver.getRoute('journals._id')}
            render={({match}) => <JournalView match={match} etesync={context} />}
          />
        </Switch>
      </JournalFetcher>
    );
  }
}

const mapStateToProps = (state: StoreState) => {
  return {
    credentials: state.credentials,
  };
};

export default withRouter(connect(
  mapStateToProps
)(EteSyncContext));