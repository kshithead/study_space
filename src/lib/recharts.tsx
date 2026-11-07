import type { ReactNode } from "react";
import {
  Tooltip as UpstreamTooltip,
  type TooltipProps as UpstreamTooltipProps,
} from "recharts";

export * from "recharts";

type UpstreamProps = UpstreamTooltipProps<any, any>;

export function Tooltip(props: any) {
  return <UpstreamTooltip {...(props as UpstreamProps)} />;
}
