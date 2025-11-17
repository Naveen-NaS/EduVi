"use client";

import Loader from "@/components/ui/loader";

export default function Loading() {
  // App-level loading UI while routes/data are suspenseful
  return <Loader fullscreen label="Loading" />;
}
