import notificationapi from 'notificationapi-node-server-sdk'

notificationapi.init(
  process.env.NOTIFICATION_API_CLIENT_ID!,
  process.env.NOTIFICATION_API_CLIENT_SECRET!
)

export default notificationapi
