import React, { Fragment } from 'react';
import { isEmpty } from 'lodash';
import propTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '~/components/Grid';
import Button from '~/components/Buttons';
import TextInput from '~/components/FormFields/TextInput';

const styles = () => ({
  buttonGrid: {
    display: 'flex',
    justifyContent: 'center',
  },
  frame: {
    width: '270px',
    height: '80px',
    position: 'relative',
  },
  img: {
    width: 'auto',
    height: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    position: 'absolute',
  },
});

const FileInput = ({
  name,
  value,
  displayText,
  onChange,
  buttonAlign,
  classes,
  accept,
  ...props
}) => {
  return (
    <Fragment>
      <Grid container>
        <Grid item xs={10} md={11}>
          <TextInput name={name} value={displayText} {...props} />
        </Grid>
        <Grid
          item
          xs={2}
          md={1}
          className={classes.buttonGrid}
          style={{ alignItems: buttonAlign }}>
          <input
            hidden
            type='file'
            id='file-upload-btn'
            accept={accept}
            onChange={onChange}
          />
          <label htmlFor='file-upload-btn'>
            <Button text='上传' component='span' />
          </label>
        </Grid>
      </Grid>
      {!isEmpty(value) && (
        <div className={classes.frame}>
          <img src={value} loading='lazy' className={classes.img} alt='' />
        </div>
      )}
    </Fragment>
  );
};

FileInput.propTypes = {
  buttonAlign: propTypes.string,
  value: propTypes.string,
  accept: propTypes.string,
};

FileInput.defaultProps = {
  buttonAlign: 'center',
  value: '',
  accept: '.xlsx,image/*',
};

export default withStyles(styles)(FileInput);
