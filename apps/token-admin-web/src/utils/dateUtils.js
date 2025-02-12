import {
  set,
  format,
  addDays,
  parseISO,
  getUnixTime,
  fromUnixTime,
} from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';
export const DATE_SECONDS_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const toStringDate = timestamp =>
  parseISO(timestamp) ? fromUnixTime(timestamp / 1000) : new Date();

const DEFAULT_SEARCH_START_TIME = {
  hours: 0,
  minutes: 0,
  seconds: 0,
};

const DEFAULT_SEARCH_END_TIME = {
  hours: 23,
  minutes: 59,
  seconds: 59,
};

export const getDefaultSearchRange = (range = 0) => {
  const defaultSearchStartTime = set(new Date(), DEFAULT_SEARCH_START_TIME);
  const defaultSearchEndTime = set(new Date(), DEFAULT_SEARCH_END_TIME);
  return {
    startDt: addDays(defaultSearchStartTime, range),
    endDt: addDays(defaultSearchEndTime, 0),
  };
};

export const toDateText = date => format(toStringDate(date), DATE_FORMAT);

export const toDateTimeText = date =>
  format(toStringDate(date), DATE_TIME_FORMAT);

export const toDateSecondsText = date =>
  format(toStringDate(date), DATE_SECONDS_FORMAT);

export const stringToTimestamp = stringDate =>
  getUnixTime(parseISO(stringDate)) * 1000;

export const toTimestamp = date => getUnixTime(date) * 1000;
