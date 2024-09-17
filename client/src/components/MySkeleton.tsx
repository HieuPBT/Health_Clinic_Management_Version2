import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface MySkeletonProps {
  rows: number;
  className?: string;
  minWidth?: number;
  maxWidth?: number;
}

const MySkeleton: React.FC<MySkeletonProps> = ({
  rows,
  className = "",
  minWidth = 70,
  maxWidth = 100
}) => {
  const getRandomWidth = () => {
    return Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
  };

  const getRandomHeight = () => {
    return Math.floor(Math.random() * (48 - 16 + 16) + 16);
  };

  return (
    <div className={`space-y-2 m-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          style={{ width: `${getRandomWidth()}%`, height: `${getRandomHeight()}px` }}
        />
      ))}
    </div>
  );
};

export default MySkeleton;
