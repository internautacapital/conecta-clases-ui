import React from "react";
import { Skeleton } from "./skeleton";
import { Badge } from "./badge";

interface RoleBadgeProps {
  isLoading: boolean;
  roles?: string[];
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ isLoading, roles }) => {
  if (isLoading) {
    return (
      <div className="flex items-center">
        <Skeleton className="h-[20px] w-[150px] rounded-sm bg-gray-200" />
      </div>
    );
  }

  if (roles?.includes("teacher")) {
    return (
      <Badge
        variant="outline"
        color="blue"
        className="bg-gray-300 rounded-[4px] border border-gray-400 text-black"
      >
        Profesor
      </Badge>
    );
  }
};
