import Head from 'next/head'
// import styles from '@/styles/Home.module.css'
import { Divider, Title } from '@mantine/core'
import { ConnectFourBoard } from '../../libs/connect-four/ConnectFourBoard'

export default function Home() {
  return (
    <>
      <Head>
        <title>Connect Four</title>
        <meta name="description" content="Connect Four Game App" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Title style={{textAlign: 'center', marginTop: 50}}>Connect Four</Title>
        <Divider my="sm" />
        <ConnectFourBoard />
      </main>
    </>
  )
}
