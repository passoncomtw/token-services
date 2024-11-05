import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import * as yup from 'yup';
import cloneDeep from 'lodash/cloneDeep';
import update from 'lodash/update';
import Grid from '~/components/Grid';
import Button from '~/components/Buttons';
import Panel from '~/components/Panels/Panel';
import HeaderBar from '~/components/HeaderBar';
import LabelText from '~/components/FormFields/LabelText';
import GridTextInput from './components/GridTextInput';
import FeeSettings from '~/components/FormFields/FeeSettings';
import { PanelFooter, PanelHeader } from '~/components/Panels';
import { handleYupSchema, handleYupErrors } from '~/utils/formCheck';
import {
  emailSchema,
  phoneSchema,
  accountSchema,
  passwordSchema,
  userNameSchema,
  contactorSchema,
  transactionCodeSchema,
} from '~/constants/yupSchemas/user';
import { commissionSchema } from '~/constants/yupSchemas/commission';

const schema = yup.object().shape({
  account: accountSchema,
  password: passwordSchema,
  name: userNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  transactionCode: transactionCodeSchema,
  contactor: contactorSchema,
  // telegram: telegramSchema,
  buyLadderFee: commissionSchema,
  sellLadderFee: commissionSchema,
});

const DEFAULT_PAYLOAD = {
  type: 0,
  account: 'testmerachant001',
  name: 'testmerachant001',
  email: 'mitak18246@fkcod.com',
  password: 'a12345678',
  phone: '0987665656',
  transactionCode: 'a123456',
  contactor: 'testmerachant001',
  telegram: '',
  buyPercentageFee: [
    { amount: 100, feePercent: 0.1 },
    { amount: 1000, feePercent: 0.5 },
  ],
  sellPercentageFee: [
    { amount: 100, feePercent: 0.1 },
    { amount: 1000, feePercent: 0.5 },
  ],
  buyLadderFee: {
    feeType: 0,
    feePercent: 0,
    minFee: 0,
    maxFee: 0,
    steps: [],
  },
  sellLadderFee: {
    feeType: 0,
    feePercent: 0,
    minFee: 0,
    maxFee: 0,
    steps: [],
  },
};

const CreateUserScreen = props => {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const history = useHistory();
  const [errors, setErrors] = useState({});

  const onInfoChange = env => {
    const { name, value } = env;
    setPayload(state => {
      return { ...state, [name]: value };
    });
  };

  const { handleAddUser } = props;

  const onFeeChange = ({ getInKeys, value }) => {
    setPayload(state => {
      const nextState = cloneDeep(state);
      return update(nextState, getInKeys.join('.'), () => value);
    });
  };

  const onSubmit = async () => {
    try {
      await handleYupSchema(schema, payload);

      handleAddUser({
        ...payload,
        onSuccess: () => history.push('/users/list'),
      });
    } catch (error) {
      const err = handleYupErrors(error);
      setErrors(err);
    }
  };

  return (
    <Box m={3}>
      <HeaderBar title='新增商家' />
      <Panel>
        <PanelHeader title='填寫商家資料' />
        <Box pt={0} pb={3} px={3}>
          <Grid container>
            <GridTextInput
              title='帳號'
              name='account'
              value={payload.account}
              onChange={onInfoChange}
              errorMessage={errors.account}
            />
            <GridTextInput
              title='商家名稱'
              name='name'
              value={payload.name}
              onChange={onInfoChange}
              errorMessage={errors.name}
            />
            <Grid quarter>
              <LabelText title='會員類型' value='商家' />
            </Grid>
            <GridTextInput
              title='聯絡人姓名'
              name='contactor'
              value={payload.contactor}
              onChange={onInfoChange}
              errorMessage={errors.contactor}
            />
            <GridTextInput
              title='手機號'
              name='phone'
              value={payload.phone}
              onChange={onInfoChange}
              errorMessage={errors.phone}
            />
            <GridTextInput
              title='Telegram'
              name='telegram'
              value={payload.telegram}
              onChange={onInfoChange}
              errorMessage={errors.telegram}
            />
            <GridTextInput
              title='郵箱'
              name='email'
              value={payload.email}
              onChange={onInfoChange}
              errorMessage={errors.email}
            />
            <GridTextInput
              title='登錄密碼'
              name='password'
              value={payload.password}
              onChange={onInfoChange}
              errorMessage={errors.password}
            />
            <GridTextInput
              title='交易密碼'
              name='transactionCode'
              value={payload.transactionCode}
              onChange={onInfoChange}
              errorMessage={errors.transactionCode}
            />
          </Grid>
        </Box>
        <PanelHeader title='購買手續費' />
        <Box pt={0} pb={3} px={3}>
          <FeeSettings
            errors={errors}
            name='buyLadderFee'
            payload={payload}
            onChange={onFeeChange}
          />
        </Box>
        <PanelHeader title='出售手續費' />
        <Box pt={0} pb={3} px={3}>
          <FeeSettings
            errors={errors}
            name='sellLadderFee'
            payload={payload}
            onChange={onFeeChange}
          />
        </Box>
        <PanelFooter>
          <Button text='完成' onClick={onSubmit} />
        </PanelFooter>
      </Panel>
    </Box>
  );
};

export default CreateUserScreen;
