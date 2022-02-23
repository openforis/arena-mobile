import {createSelector} from 'reselect'

const getUserState = state => state?.user
const getUser = createSelector(getUserState, user => user)
const getName = createSelector(getUser, user => user?.name)
const getEmail = createSelector(getUser, user => user?.email)

export default {
  getUser,
  getName,
  getEmail,
}
