<script setup lang="ts">
import { cva } from "class-variance-authority";
import { computed } from "vue";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        secondary: "bg-secondary text-foreground hover:bg-accent",
        outline: "border border-border bg-transparent text-foreground hover:border-foreground/20 hover:bg-secondary",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const props = defineProps<{ variant?: "default" | "secondary" | "outline" | "ghost"; size?: "default" | "sm" | "lg"; class?: string; disabled?: boolean }>();
const classes = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class));
</script>

<template>
  <button :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
