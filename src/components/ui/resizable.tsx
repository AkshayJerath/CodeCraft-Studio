"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import {
  PanelGroup as ResizablePrimitivePanelGroup,
  Panel as ResizablePrimitivePanel,
  PanelResizeHandle as ResizablePrimitivePanelResizeHandle,
  type PanelGroupProps as ResizablePrimitivePanelGroupProps,
  type PanelProps as ResizablePrimitivePanelProps,
  type PanelResizeHandleProps as ResizablePrimitivePanelResizeHandleProps,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


const ResizablePanelGroup = React.forwardRef<
  ImperativePanelGroupHandle,
  React.PropsWithChildren<ResizablePrimitivePanelGroupProps>
>(({ className, ...props }, ref) => (
  <ResizablePrimitivePanelGroup
    ref={ref}
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
))
ResizablePanelGroup.displayName = "ResizablePanelGroup"

const ResizablePanel = React.forwardRef<
    HTMLDivElement,
    React.PropsWithChildren<ResizablePrimitivePanelProps>
>((props, ref) => (
    <ResizablePrimitivePanel
        ref={ref}
        {...props}
    />
))
ResizablePanel.displayName = "ResizablePanel"


const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    ResizablePrimitivePanelResizeHandleProps & {
      withHandle?: boolean
    }
  >
>(({ className, children, withHandle, ...props }, ref) => (
  <ResizablePrimitivePanelResizeHandle
    ref={ref}
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-dragging=true]]:bg-primary/50 [&[data-dragging=true]]:opacity-80",
      className
    )}
    {...props}
  >
    {withHandle && (
      <Button
        variant="ghost"
        size="icon"
        className="z-10 flex h-8 w-6 items-center justify-center rounded-sm border bg-border hover:bg-muted active:bg-muted p-0"
        asChild
      >
        <div><GripVertical className="h-3 w-3 text-muted-foreground" /></div>
      </Button>
    )}
    {children}
  </ResizablePrimitivePanelResizeHandle>
))
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
