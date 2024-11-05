import React from 'react';
import { Breadcrumbs as BasicBreadcrumbs } from '@material-ui/core';
import Link from '~/components/Link';
import colors from '~/theme/colors';

const Breadcrumb = ({ parentName, currentName, parentPath, history }) => {
  const onGoBack = () => history.goBack();

  const onReload = () => window.location.reload(false);

  return (
    <BasicBreadcrumbs>
      <Link color={colors.primary} href={parentPath} onClick={onGoBack}>
        {parentName}
      </Link>
      <Link color={colors.grey} href='' onClick={onReload}>
        {currentName}
      </Link>
    </BasicBreadcrumbs>
  );
};

export default Breadcrumb;
