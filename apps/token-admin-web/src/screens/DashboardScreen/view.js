import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  ButtonGroup,
  List,
  ListItem,
} from '@material-ui/core';
import {
  ArrowUpward,
  ArrowDownward,
  Receipt,
  Person,
} from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: '#ebedf2',
    padding: theme.spacing(3),
  },
  // 統計卡片樣式
  statsCard: {
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  statsTitle: {
    fontSize: 14,
    color: '#484848',
    marginBottom: theme.spacing(1),
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 500,
    color: '#15151b',
  },
  statsInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    marginTop: theme.spacing(1),
  },
  positive: {
    color: '#0dc884',
  },
  negative: {
    color: '#ff4a46',
  },
  arrowIcon: {
    fontSize: 16,
    marginRight: theme.spacing(0.5),
  },
  // 圖表卡片樣式
  chartCard: {
    padding: theme.spacing(3),
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#4d5b69',
  },
  chartActions: {
    display: 'flex',
    gap: '10px',
  },
  chartAction: {
    padding: '4px 8px',
    fontSize: 12,
    color: '#484848',
    backgroundColor: 'transparent',
    '&.active': {
      backgroundColor: '#ffcc00',
      color: '#15151b',
    },
  },
  chartContent: {
    height: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#484848',
    border: '1px dashed #e0e0e0',
    borderRadius: 4,
  },
  chartInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  chartMetric: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    color: '#484848',
  },
  chartMetricDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginRight: theme.spacing(1),
  },
  primaryDot: {
    backgroundColor: '#ffcc00',
  },
  infoDot: {
    backgroundColor: '#00BCD4',
  },
  // 活動列表樣式
  activityCard: {
    padding: theme.spacing(3),
  },
  activityHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#4d5b69',
  },
  viewAll: {
    color: '#ffcc00',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  activityList: {
    padding: 0,
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    borderRadius: 4,
    backgroundColor: '#ebedf2',
    marginBottom: theme.spacing(1),
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing(1.5),
  },
  orderIcon: {
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    color: '#00BCD4',
  },
  userIcon: {
    backgroundColor: 'rgba(13, 200, 132, 0.1)',
    color: '#0dc884',
  },
  activityInfo: {
    flexGrow: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#4d5b69',
    marginBottom: theme.spacing(0.5),
  },
  activityTime: {
    fontSize: 12,
    color: '#484848',
  },
}));

const DashboardView = ({ data }) => {
  const classes = useStyles();
  const { stats, activities } = data;

  // 渲染統計卡片
  const renderStatsCards = () => {
    return stats.map(stat => (
      <Grid item xs={12} sm={6} md={3} key={stat.id}>
        <Paper className={classes.statsCard} elevation={2}>
          <Typography className={classes.statsTitle}>{stat.title}</Typography>
          <Typography className={classes.statsValue}>{stat.value}</Typography>
          <Box
            className={`${classes.statsInfo} ${
              stat.isPositive ? classes.positive : classes.negative
            }`}
          >
            {stat.isPositive ? (
              <ArrowUpward className={classes.arrowIcon} />
            ) : (
              <ArrowDownward className={classes.arrowIcon} />
            )}
            <span>{stat.change}% 較上月</span>
          </Box>
        </Paper>
      </Grid>
    ));
  };

  // 渲染活動項目
  const renderActivityItems = () => {
    return activities.map(activity => (
      <ListItem className={classes.activityItem} key={activity.id}>
        <Box
          className={`${classes.activityIcon} ${
            activity.type === 'order' ? classes.orderIcon : classes.userIcon
          }`}
        >
          {activity.type === 'order' ? (
            <Receipt fontSize='small' />
          ) : (
            <Person fontSize='small' />
          )}
        </Box>
        <Box className={classes.activityInfo}>
          <Typography className={classes.activityMessage}>
            {activity.message}
          </Typography>
          <Typography className={classes.activityTime}>
            {activity.time}
          </Typography>
        </Box>
      </ListItem>
    ));
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {renderStatsCards()}
      </Grid>

      <Grid container spacing={3} style={{ marginTop: 16 }}>
        <Grid item xs={12} md={8}>
          <Paper className={classes.chartCard} elevation={2}>
            <Box className={classes.chartHeader}>
              <Typography className={classes.chartTitle}>交易趨勢</Typography>
              <ButtonGroup size='small' aria-label='時間過濾'>
                <Button className={classes.chartAction}>週</Button>
                <Button className={`${classes.chartAction} active`}>月</Button>
                <Button className={classes.chartAction}>年</Button>
              </ButtonGroup>
            </Box>
            <Box className={classes.chartContent}>[線圖顯示交易趨勢]</Box>
            <Box className={classes.chartInfo}>
              <Box className={classes.chartMetric}>
                <Box
                  className={`${classes.chartMetricDot} ${classes.primaryDot}`}
                ></Box>
                <span>交易金額</span>
              </Box>
              <Box className={classes.chartMetric}>
                <Box
                  className={`${classes.chartMetricDot} ${classes.infoDot}`}
                ></Box>
                <span>訂單數量</span>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 用戶分布圖表 */}
        <Grid item xs={12} md={4}>
          <Paper className={classes.chartCard} elevation={2}>
            <Box className={classes.chartHeader}>
              <Typography className={classes.chartTitle}>用戶分布</Typography>
            </Box>
            <Box className={classes.chartContent}>[圓餅圖顯示用戶分布]</Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 最近活動區域 */}
      {/* <Grid container spacing={3} style={{ marginTop: 16 }}>
        <Grid item xs={12}>
          <Paper className={classes.activityCard} elevation={2}>
            <Box className={classes.activityHeader}>
              <Typography className={classes.activityTitle}>最近活動</Typography>
              <Button className={classes.viewAll}>查看全部</Button>
            </Box>
            <List className={classes.activityList}>
              {renderActivityItems()}
            </List>
          </Paper>
        </Grid>
      </Grid> */}
    </div>
  );
};

export default DashboardView;
