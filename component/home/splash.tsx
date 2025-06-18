import '@scss/home/splash.scss'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '@assets/img/logo.png'
import MockApp from '@component/home/mock'
import { title } from '@util/metadata'

export default function HomeSplash() {
  return (
    <div id="splash">
      <div className="splash-copy">
        <div className="splash-brand">
          <Image src={Logo} alt="Logo" priority />
          {title}
        </div>
        <p className="copy">
          A free, open-source chat app built for seamless collaboration
        </p>

        <div className="splash-buttons">
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      </div>
      <MockApp />
    </div>
  )
}
