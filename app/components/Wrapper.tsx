import React from 'react'
import { Layout } from 'antd'
const { Content } = Layout

type WrapperProps = {
    children : React.ReactNode
}

const Wrapper = ({children} : WrapperProps ) => {
  return (
    // Keep layout but remove the per-page Header to avoid duplicating the global Navbar
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: 16 }}>
        {children}
      </Content>
    </Layout>
  )
}

export default Wrapper