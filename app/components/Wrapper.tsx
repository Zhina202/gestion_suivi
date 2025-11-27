import React from 'react'

type WrapperProps = {
    children : React.ReactNode
}

const Wrapper = ({children} : WrapperProps ) => {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 70px)', 
      background: 'linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)', 
      padding: '32px 0', 
      marginTop: '70px',
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