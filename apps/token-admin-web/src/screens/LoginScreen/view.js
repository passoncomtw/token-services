import React from 'react';
import * as yup from 'yup';
import isEmpty from 'lodash/isEmpty';
import { Box, Container, withStyles } from '@material-ui/core';
import Button from '~/components/Buttons';
import Typography from '~/components/Typography';
import { Panel, PanelBody } from '~/components/Panels';
import TextInput from '~/components/FormFields/TextInput';
import LoginLogo from '~/assets/images/login-logo.png';
import {
  loginAccountSchema,
  passwordSchema,
} from '~/constants/yupSchemas/user';
import { handleYupSchema, handleYupErrors } from '~/utils/formCheck';
import packageConfig from '~/../package.json';

const loginSchema = yup.object().shape({
  account: loginAccountSchema,
  password: passwordSchema,
});

class LoginScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      password: '',
      errors: {},
    };
  }

  onKeydown = event => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter')
      this.handleSubmit();
  };

  handleInputChange = ({ value, name }) => this.setState({ [name]: value });

  validateData = async () => {
    try {
      const { account, password } = this.state;
      await handleYupSchema(loginSchema, { account, password });
      this.setState(state => ({ ...state, errors: {} }));
      return true;
    } catch (error) {
      const errors = handleYupErrors(error);
      this.setState(state => ({ ...state, errors }));
      return false;
    }
  };

  onBlur = async () => {
    if (!isEmpty(this.state.errors)) await this.validateData();
  };

  onConfirm = async () => {
    if (!(await this.validateData())) return;
    const { history } = this.props;
    const { account, password } = this.state;
    this.props.handleLogin({ account, password, history });
  };

  render() {
    const { classes } = this.props;

    return (
      <form>
        <Container className={classes.container}>
          <Panel className={classes.loginPanel}>
            <PanelBody>
              <Box className={classes.logoBox}>
                <img src={LoginLogo} alt='LoginLogo' />
              </Box>
              <Box className={classes.inputBox}>
                <TextInput
                  title='賬號'
                  name='account'
                  placeholder='請輸入帳號'
                  onBlur={this.onBlur}
                  value={this.state.account}
                  onChange={this.handleInputChange}
                  errorMessage={this.state.errors.account}
                />
                <TextInput
                  title='登錄密碼'
                  name='password'
                  type='password'
                  maxLength={20}
                  autocomplete={false}
                  placeholder='請輸入登錄密碼'
                  onBlur={this.onBlur}
                  value={this.state.password}
                  onChange={this.handleInputChange}
                  errorMessage={this.state.errors.password}
                />
              </Box>
              <Box pt={4}>
                <Button
                  text='登錄'
                  type='primary'
                  size='large'
                  data-testid='submit'
                  onClick={this.onConfirm}
                />
              </Box>
              <Box pt={4} className={classes.version}>
                <Typography variant='h5'>
                  V {`${packageConfig.version}`}
                </Typography>
              </Box>
            </PanelBody>
          </Panel>
        </Container>
      </form>
    );
  }
}

const styles = theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: theme.colors.bodybg,
  },
  loginPanel: {
    width: '30%',
    maxWidth: 600,
    overflow: 'hidden',
    textAlign: 'center',
    backgroundColor: theme.colors.error,
    [theme.breakpoints.down('md')]: {
      width: '90%',
    },
  },
  logoBox: {
    height: 'auto',
    justifyContent: 'center',
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(2),
  },
  inputBox: {
    textAlign: 'left',
    padding: '0px 65px',
    [theme.breakpoints.down('md')]: {
      padding: '15px 30px',
    },
  },
  version: {
    color: theme.colors.greylight,
  },
});

export default withStyles(styles)(LoginScreen);
