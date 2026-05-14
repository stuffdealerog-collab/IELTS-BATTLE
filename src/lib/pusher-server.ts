import Pusher from 'pusher'

declare global {
  // eslint-disable-next-line no-var
  var __pusher: Pusher | undefined
}

function makePusher() {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET ||
    !process.env.PUSHER_CLUSTER
  ) {
    return null
  }
  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  })
}

export const pusher = global.__pusher ?? makePusher() ?? undefined
if (process.env.NODE_ENV !== 'production' && pusher) global.__pusher = pusher

export async function publish(channel: string, event: string, data: unknown) {
  if (!pusher) return
  try {
    await pusher.trigger(channel, event, data)
  } catch (e) {
    console.warn('Pusher publish failed', e)
  }
}

export function battleChannel(battleId: string) {
  return `battle-${battleId}`
}
