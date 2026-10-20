import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { type WebhookEvent } from '@clerk/nextjs/server'
import { env } from '@/env'
import { XataClient } from '@/xata'

const client = new XataClient()

const WEBHOOK_SECRET = env.AUTH_WEBHOOK_SECRET

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  switch (eventType) {
    case 'user.created':
    case 'user.updated':
      const {
        first_name,
        last_name,
        email_addresses,
        image_url,
        public_metadata: { role },
      } = evt.data
      const name = `${first_name} ${last_name}`
      await client.db.nextauth_users.createOrUpdate({
        id,
        name,
        role,
        email: email_addresses[0]?.email_address,
        image: image_url,
      })
      break
    case 'user.deleted':
      await client.db.nextauth_users.delete(id ?? "")
      break
    // case 'session.created':
    // 	break
    // case 'session.ended':
    // 	break
    // case 'session.removed':
    // 	break
    // case 'session.revoked':
    // 	break
    // case 'email.created':
    // 	break
    // case 'sms.created':
    // 	break
    // case 'organization.created':
    // 	break
    // case 'organization.updated':
    // case 'organization.deleted':
    // case 'organizationMembership.created':
    // case 'organizationMembership.deleted':
    // case 'organizationMembership.updated':
    // case 'organizationInvitation.accepted':
    // case 'organizationInvitation.created':
    // case 'organizationInvitation.revoked':
  }

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  return new Response('', { status: 200 })
}

