import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

export function DynIcon({ name, ...p }: { name: string } & LucideProps) {
  const C = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name] ?? Icons.Store;
  return <C {...p} />;
}
