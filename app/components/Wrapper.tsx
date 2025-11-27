import React from 'react'

type WrapperProps = {
    children : React.ReactNode
}

const Wrapper = ({children} : WrapperProps ) => {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f5f5f5', padding: '24px 0', marginTop: '64px' }}>
      {children}
    </div>
  )
}

export default Wrapper