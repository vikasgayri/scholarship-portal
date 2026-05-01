import { cn } from "../../lib/utils";

export default function Card({ as: Component = "section", className, children, ...props }) {
  return (
    <Component
      className={cn(
        "surface-outline rounded-3xl p-5 sm:p-6",
        "transition duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
