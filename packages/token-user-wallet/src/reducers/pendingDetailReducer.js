import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { pendingDetailState } from './initialState';

export default function reducer(
  pendingDetail = pendingDetailState,
  { type, payload }
) {
  switch (type) {
    case types.LOGOUT_SUCCESS:
      return pendingDetailState;
    case types.GET_PENDING_DETAIL_SUCCESS:
      return pendingDetail.merge(fromJS(payload));
    case types.GET_PENDING_DETAIL_ERROR:
    case types.GET_PENDING_DETAIL:
    default:
      return pendingDetail;
  }
}
