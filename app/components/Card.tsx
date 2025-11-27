import React from "react";
import { Card as AntCard } from 'antd';

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
};

const Card: React.FC<Props> = ({ children, className = "", title, extra }) => {
  return (
    <AntCard 
      className={`${className} w-full ceni-card`}
      bodyStyle={{ 
        padding: 24, 
        width: '100%', 
        maxWidth: '100%',
        borderRadius: '8px'
      }}
      title={title ? <div className="font-semibold text-gray-800">{title}</div> : undefined}
      extra={extra}
      bordered={false}
      styles={{
        header: {
          borderBottom: '1px solid #E9ECEF',
          padding: '16px 24px',
          background: 'linear-gradient(90deg, #F8F9FA 0%, #FFFFFF 100%)'
        }
      }}
    >
      {children}
    </AntCard>
  );
};

export default Card;
