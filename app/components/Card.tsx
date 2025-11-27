import React from "react";
import { Card as AntCard } from 'antd';

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<Props> = ({ children, className = "" }) => {
  return (
    <AntCard className={className} bodyStyle={{ padding: 16 }}>
      {children}
    </AntCard>
  );
};

export default Card;
