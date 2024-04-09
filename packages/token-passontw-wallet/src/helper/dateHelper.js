import {
  isDate,
  addMinutes,
  formatDuration,
  intervalToDuration,
  differenceInSeconds,
} from 'date-fns';
import {
  format,
  fromUnixTime,
  isAfter as BaseIsAfter,
  isBefore as BaseIsBefore,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import isNull from 'lodash/isNull';

const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const MINUTES_FORMAT = 'mm:ss';

export const SECONDS_FORMAT = 'ss';

export const getCountDown = (expiredDate) => {
  const currentDate = new Date();
  const termination = differenceInSeconds(expiredDate, currentDate) <= 0;
  const duration = intervalToDuration({ start: currentDate, end: expiredDate });
  const text = formatDuration(duration, { locale: zhCN });

  return { termination, text };
};

const handleServerTimeStamp = (timestamp = null) => {
  if (isNull(timestamp)) return new Date(); // 暫時用
  if (isDate(timestamp)) return timestamp;

  const handledTimeStamp =
    timestamp.toString().length >= 13 ? timestamp / 1000 : timestamp;
  return fromUnixTime(handledTimeStamp);
};

export const addMinutesWithTimestamp = (date, amount) => {
  return addMinutes(handleServerTimeStamp(date), amount);
};

export const formatDateTimeWithSecond = (timestamp) => {
  return format(handleServerTimeStamp(timestamp), DATE_TIME_FORMAT);
};

export const isAfterNow = (dateToCompare) => {
  return BaseIsAfter(new Date(), handleServerTimeStamp(dateToCompare));
};

export const isBeforeNow = (dateToCompare) => {
  return BaseIsBefore(new Date(), handleServerTimeStamp(dateToCompare));
};
