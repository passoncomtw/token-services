import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import { Box } from '@material-ui/core';
import Adornment from '~/components/FormFields/TextInput/Adornment';
import { TextInput, SelectInput } from '~/components/FormFields';
import ChannelFeeTable from '../ChannelFeeTable';

const FEE_PERCENTAGE_TYPES = {
  PERCENT: 0,
  GRADIENT: 1,
};

const FEE_TYPE_ITEMS = [
  { value: FEE_PERCENTAGE_TYPES.PERCENT, name: '百分比' },
  { value: FEE_PERCENTAGE_TYPES.GRADIENT, name: '階梯式' },
];

const DEFAULT_FEE = [
  { amount: 0, feePercent: 0.01 },
  { amount: 0, feePercent: 0.01 },
];

const PercentFeeContent = props => {
  const {
    show,
    errors,
    propsName,
    feePercent,
    maxFee,
    minFee,
    onBlur,
    onChange,
  } = props;

  if (!show) return <Fragment />;

  return (
    <Fragment>
      <Box flex={1}>
        <TextInput
          title='手續費率'
          type='number'
          name='feePercent'
          value={feePercent}
          onBlur={onBlur}
          onChange={onChange}
          errorMessage={errors[`${propsName}.feePercent`]}
          endAdornment={<Adornment text='%' position='end' />}
        />
      </Box>
      <Box flex={1}>
        <TextInput
          title='最低手續費'
          name='minFee'
          type='number'
          value={minFee}
          onBlur={onBlur}
          onChange={onChange}
          errorMessage={errors[`${propsName}.minFee`]}
          endAdornment={<Adornment text='元' position='end' />}
        />
      </Box>
      <Box flex={1}>
        <TextInput
          title='最高手續費'
          name='maxFee'
          type='number'
          value={maxFee}
          onBlur={onBlur}
          onChange={onChange}
          errorMessage={errors[`${propsName}.maxFee`]}
          endAdornment={<Adornment text='元' position='end' />}
        />
      </Box>
    </Fragment>
  );
};

const GradientFeeContent = ({ show, ...props }) => {
  if (!show) return <Fragment />;

  return (
    <Box display='flex' alignItems='center' pt={1}>
      <ChannelFeeTable {...props} />
    </Box>
  );
};

const handleChange =
  (onChange, keys = []) =>
  ({ name, value }) => {
    const getInKeys = [...keys, name];
    onChange({ getInKeys, value });
  };

const handleFeeTypeChange =
  (onChange, keys = []) =>
  ({ name, value }) => {
    const getInKeys = [...keys, name];
    onChange({ getInKeys, value });

    const stepKeys = [...keys, 'steps'];

    value === FEE_PERCENTAGE_TYPES.PERCENT
      ? onChange({ getInKeys: stepKeys, value: [] })
      : onChange({ getInKeys: stepKeys, value: DEFAULT_FEE });
  };

const handleStepsChange =
  (onChange, keys = []) =>
  ({ value }) => {
    onChange({ getInKeys: keys, value });
  };

const FeeSettings = props => {
  const {
    name: propsName,
    onChange: propsOnChange,
    errors,
    onBlur,
    payload,
  } = props;

  const commissions = payload[propsName];
  const { feeType, feePercent, minFee, maxFee, steps } = commissions;

  const onChange = handleChange(propsOnChange, [propsName]);
  const onFeeTypeChange = handleFeeTypeChange(propsOnChange, [propsName]);
  const onStepsChange = handleStepsChange(propsOnChange, [propsName, 'steps']);
  const onCreateStepClick = handleStepsChange(propsOnChange, [
    propsName,
    'steps',
  ]);

  return (
    <Fragment>
      <Box display='inline-flex' width='100%'>
        <Box flex={1} maxWidth={280}>
          <SelectInput
            title='手續費類型'
            name='feeType'
            items={FEE_TYPE_ITEMS}
            value={feeType}
            onChange={onFeeTypeChange}
          />
        </Box>
        <PercentFeeContent
          propsName={propsName}
          show={feeType === FEE_PERCENTAGE_TYPES.PERCENT}
          feePercent={feePercent}
          onChange={onChange}
          minFee={minFee}
          onBlur={onBlur}
          errors={errors}
          maxFee={maxFee}
        />
      </Box>
      <Box>
        <GradientFeeContent
          rows={steps}
          show={feeType === FEE_PERCENTAGE_TYPES.GRADIENT}
          onChange={onStepsChange}
          onClick={onCreateStepClick}
          name={propsName}
          errors={errors}
        />
      </Box>
    </Fragment>
  );
};

FeeSettings.propTypes = {
  channelStatus: propTypes.oneOf([0, 1]),
  feeType: propTypes.number,
  feePercentage: propTypes.number,
  feeRate: propTypes.number,
  minFee: propTypes.number,
  maxFee: propTypes.number,
  steps: propTypes.arrayOf(
    propTypes.shape({
      amount: propTypes.number,
      feeRate: propTypes.number,
    })
  ),
  errors: propTypes.object,
  onBlur: propTypes.func,
  onChange: propTypes.func,
  transactionType: propTypes.number,
};

FeeSettings.defaultProps = {
  channelStatus: 1,
  feeType: 1,
  feePercentage: 0,
  feeRate: 0,
  minFee: 0,
  maxFee: 0,
  steps: [],
  errors: {},
  onBlur: () => false,
  onChange: () => false,
  transactionType: 0,
};

export default FeeSettings;
