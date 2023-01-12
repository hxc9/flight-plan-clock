import './globals.css'
import { Roboto_Flex } from '@next/font/google'
import styles from './page.module.css'

const roboto = Roboto_Flex({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
      <main className={styles.main + ' ' + roboto.className}>
          {children}
      </main>
      </body>
    </html>
  )
}
