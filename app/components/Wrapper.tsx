import React from 'react'

type WrapperProps = {
    children : React.ReactNode
}

const Wrapper = ({children} : WrapperProps ) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px 0' }}>
      {children}
    </div>
  )
}

export default Wrapper