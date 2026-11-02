import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "link";
};

// Shared button used on every page, so all buttons look the same.
export default function Button({ variant = "secondary", className, ...props }: ButtonProps) {
  return <button className={[variant, className].filter(Boolean).join(" ")} {...props} />;
}
