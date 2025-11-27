import React from 'react'
import { Layout } from 'antd'

type WrapperProps = {
    children : React.ReactNode
}

const Wrapper = ({children} : WrapperProps ) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Layout.Content style={{ padding: '24px 0' }}>
        {children}
      </Layout.Content>
    </Layout>
  )
}

export default Wrapper