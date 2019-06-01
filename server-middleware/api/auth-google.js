import axios from 'axios'

// note by default auth-module returns an access_token, which can only be verified as below.
// the access_token can be used to call google services; which we have no need for here.
// ideally we'd use an id_token, but we don't have one; see the commented verifyIdToken below.
//
// note http docs are here https://developers.google.com/identity/protocols/OAuth2UserAgent
//
// https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=ya29.GlwFBwtsjQQadFl1mnbc5oZkteAqp1N2iTmRro20tdZV8Tb3jHikbeDc9DZ_5q_fMj_SRBlKRwMp8Oaa9nTx3KWa9-tpu9MkrErcdwFVAKCIXdqhVg7MeJ4GOCz21g
// {
//   "issued_to": "1017939026435-nvocl0a2j7g5m6s9df7hpub0vruu3qb7.apps.googleusercontent.com",
//   "audience": "1017939026435-nvocl0a2j7g5m6s9df7hpub0vruu3qb7.apps.googleusercontent.com",
//   "user_id": "112517201107447303528",
//   "scope": "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
//   "expires_in": 3546,
//   "email": "sullivanpt@acm.org",
//   "verified_email": true,
//   "access_type": "online"
// }
export async function verifyGoogleAccessToken(accessToken) {
  const url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
  let response
  try {
    response = (await axios.get(url)).data
  } catch (e) {
    if (e.response && e.response.status === 400)
      throw new Error('verifyGoogleAccessToken expired')
    throw e
  }
  if (
    response.issued_to !== process.env.GOOGLE_CLIENT_ID ||
    response.audience !== process.env.GOOGLE_CLIENT_ID
  )
    throw new Error('verifyGoogleAccessToken GOOGLE_CLIENT_ID')
  if (response.expires_in < 1)
    throw new Error('verifyGoogleAccessToken expires_in')
  if (!response.user_id) throw new Error('verifyGoogleAccessToken user_id')
  return response
}

// The following is for verifying a google id_token without requiring
// a round trip to the google server, making it more efficient if all
// we need is identification on our own backend. Unfortunately, because
// we are using the OAuth2 'token' flow, google doesn't send us an id_token.
// so we cannot use this approach here.
//
// see also https://stackoverflow.com/a/31597027
// and https://developers.google.com/identity/sign-in/android/backend-auth
// from https://developers.google.com/identity/sign-in/web/backend-auth
//
// const { OAuth2Client } = process.server ? require('google-auth-library') : {}
// // note this is a global, hope it is stable
// const client = OAuth2Client && new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
//
// export async function verifyGoogleIdToken(idToken) {
//   const ticket = await client.verifyIdToken({
//     idToken,
//     audience: process.env.GOOGLE_CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
//     // Or, if multiple clients access the backend:
//     // [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//   })
//   const payload = ticket.getPayload()
//   return payload
//   // const userid = payload.sub
//   // If request specified a G Suite domain:
//   // const domain = payload['hd'];
// }
