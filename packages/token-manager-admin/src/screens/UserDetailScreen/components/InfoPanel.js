import React from 'react';
import { Panel, PanelBody } from '~/components/Panels';
import { LabelText, LabelAmount } from '~/components/FormFields';
import Grid from '~/components/Grid';
import { USER_TYPE_TEXT, ACTIVE_STATUS_TEXT } from '~/constants/status.config';

const InfoPanel = ({ data }) => {
  const status = data.get('status');
  const type = data.get('type');
  return (
    <Panel>
      <PanelBody>
        <Grid container>
          <Grid quarter>
            <LabelText title='帳號' value={data.get('account')} />
          </Grid>
          <Grid quarter>
            <LabelText title='暱稱' value={data.get('name')} />
          </Grid>
          <Grid quarter>
            <LabelText title='會員狀態' value={ACTIVE_STATUS_TEXT[status]} />
          </Grid>
          <Grid quarter>
            <LabelText title='會員類型' value={USER_TYPE_TEXT[type]} />
          </Grid>
          <Grid quarter>
            <LabelAmount
              title='e幣總額'
              value={data.getIn(['wallet', 'guaranteedBalance'])}
            />
          </Grid>
          <Grid quarter>
            <LabelAmount
              title='可用餘額'
              value={data.getIn(['wallet', 'usefulBalance'])}
            />
          </Grid>
          <Grid quarter>
            <LabelAmount
              title='擔保餘額'
              value={data.getIn(['wallet', 'freezeBalance'])}
            />
          </Grid>
        </Grid>
      </PanelBody>
    </Panel>
  );
};

export default InfoPanel;
