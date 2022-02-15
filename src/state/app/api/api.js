import API from 'infra/api'

const auth = async ({serverUrl, email, password}) => {
  try {
    console.log("serverUrl, email, password", serverUrl, email, password)
    const res = {status: 200, data: 'aaa'}
    if (res.status === 204) return true
    return res?.data
  } catch (error) {
    console.log('Error::appApi:auth', {error})
    return false
  }
}

const appApi = {
  auth,
}

export default appApi
