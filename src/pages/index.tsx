import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { ConnectFourBoard } from '../../libs/connect-four/ConnectFourBoard'
import { Title } from '@mantine/core'

export default function Home() {
  return (
    <>
      <Head>
        <title>Connect Four</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Title>Connect Four</Title>

        <ConnectFourBoard />
      </main>
    </>
  )
}
