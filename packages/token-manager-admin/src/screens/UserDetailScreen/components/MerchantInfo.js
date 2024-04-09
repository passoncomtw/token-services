import React from 'react';
import isEmpty from 'lodash/isEmpty';
import CreateIcon from '@material-ui/icons/Create';
import { Fragment } from 'react';
import { LabelText } from '~/components/FormFields';
import Grid from '~/components/Grid';
import Button from '~/components/Buttons';
import Typography from '~/components/Typography';
import { formatMoney } from '~/utils/format';
import { addPointNumber } from '~/utils/channelUtils';
import { PanelBody, PanelHeader } from '~/components/Panels';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '~/components/TableFields';

const HEADERS = ['金額', '手續費率'];

export const getAmountPrefixText = (rows, index, isFirstRow, isLastRow) => {
  const currentAmount = rows.getIn([index, 'amount']);
  if (isFirstRow) return `0 ~ ${currentAmount}`;
  const amount = rows.getIn([index - 1, 'amount']) || 0;
  const prevAmount = addPointNumber(amount);
  return isLastRow ? `${prevAmount} 以上` : `${prevAmount} ~ ${currentAmount}`;
};

const PercentSettings = ({ show, data }) => {
  if (!show) return <Fragment />;

  return (
    <PanelBody>
      <Grid container>
        <Grid quarter>
          <LabelText title='手續費類型' value='百分比' />
        </Grid>
        <Grid quarter>
          <LabelText title='手續費率' value={`${data.get('feePercent')} %`} />
        </Grid>
        <Grid quarter>
          <LabelText
            title='最低手續費'
            value={formatMoney(data.get('minFee'))}
          />
        </Grid>
        <Grid quarter>
          <LabelText
            title='最高手續費'
            value={formatMoney(data.get('maxFee'))}
          />
        </Grid>
      </Grid>
    </PanelBody>
  );
};

const StepsSettings = ({ show, data }) => {
  if (!show) return <Fragment />;

  return (
    <PanelBody>
      <Grid container>
        <Grid quarter>
          <LabelText title='手續費類型' value='階梯式' />
        </Grid>
      </Grid>
      <Table>
        <TableHead headers={HEADERS} />
        <TableBody>
          {data.map((item, index) => {
            const isFirstRow = index === 0;
            const isLastRow = index === data.length - 1;
            return (
              <TableRow underline key={`${index}`}>
                <TableCell>
                  <Typography>
                    {getAmountPrefixText(data, index, isFirstRow, isLastRow)}
                  </Typography>
                </TableCell>
                <TableCell width={250}>
                  <Typography>{`${item.get('feePercent')} %`}</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </PanelBody>
  );
};

const MerchantInfo = (props) => {
  const { buying, selling, buyingDialog, sellingDialog } = props;
  return (
    <>
      <PanelHeader
        title='購買手續費'
        rightElement={
          <Button
            startIcon={<CreateIcon />}
            text='編輯'
            onClick={buyingDialog}
          />
        }
      />
      <PercentSettings
        show={!isEmpty(buying) && buying.get('feeType') === 1}
        data={buying}
      />
      <StepsSettings
        show={!isEmpty(buying) && buying.get('feeType') === 2}
        data={!isEmpty(buying) && buying.get('steps')}
      />
      <PanelHeader
        title='出售手續費'
        rightElement={
          <Button
            startIcon={<CreateIcon />}
            text='編輯'
            onClick={sellingDialog}
          />
        }
      />
      <PercentSettings
        show={!isEmpty(selling) && selling.get('feeType') === 1}
        data={sellingDialog}
      />
      <StepsSettings
        show={!isEmpty(selling) && selling.get('feeType') === 2}
        data={!isEmpty(selling) && selling.get('steps')}
      />
    </>
  );
};

export default MerchantInfo;
