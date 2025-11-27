import React from 'react'

type WrapperProps = {
    children : React.ReactNode
}

const Wrapper = ({children} : WrapperProps ) => {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 64px)', 
      background: '#f9fafb', 
      padding: '24px 0', 
      marginTop: '64px',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <div className="fade-in">
        {children}
      </div>
    </div>
  )
}

export default Wrapper