import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '../Buttons';
import TextButton from '../Buttons/TextButton';
import Panel from './Panel';
import PanelFooter from './PanelFooter';

const PanelForm = ({ onReset, onConfirm, children }) => (
  <Panel>
    <Box p={3}>{children}</Box>
    <PanelFooter align='left'>
      <Button text='发送' onClick={onConfirm} />
      <TextButton text='重置' onClick={onReset} />
    </PanelFooter>
  </Panel>
);

export default PanelForm;
