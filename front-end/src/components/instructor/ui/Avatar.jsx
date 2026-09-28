import React from "react";
import HumanAvatar from "../../common/HumanAvatar";
import { cn } from "../../../utils/cn";

export function Avatar({ className, src, alt, fallback, size = "md", ...props }) {
  const name = fallback || alt || "Instructor";
  return (
    <HumanAvatar name={name} size={size} className={className} {...props} />
  );
}
