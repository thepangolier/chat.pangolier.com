import '@scss/chat/verify.scss'
import Link from 'next/link'

export default function ChatVerify() {
  return (
    <div className="chat-verify">
      <p>
        In order to chat, you need to connect with GitHub or Google in{' '}
        <Link href="/chat/settings">Account Settings</Link>
      </p>
    </div>
  )
}
