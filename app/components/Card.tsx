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
      className={`${className} w-full`}
      bodyStyle={{ padding: 20, width: '100%', maxWidth: '100%' }}
      title={title}
      extra={extra}
      bordered={true}
    >
      {children}
    </AntCard>
  );
};

export default Card;
