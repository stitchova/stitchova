import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin",
      className
    )}
    aria-hidden="true"
  />
);

export default Spinner;