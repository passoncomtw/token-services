import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/styles';
import TableCell from '~/components/TableFields/TableCell';

const styles = theme => ({
  buttonZone: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
  },
});

const ContentTableCell = ({ hide, content, width = 160, classes }) => {
  return (
    <TableCell hide={hide} width={parseInt(width)}>
      {content ? (
        <Tooltip title={content} arrow={true} placement='bottom'>
          <div
            className={classes.buttonZone}
            style={{ maxWidth: parseInt(width) }}>
            {content}
          </div>
        </Tooltip>
      ) : (
        '--'
      )}
    </TableCell>
  );
};

export default withStyles(styles)(ContentTableCell);
