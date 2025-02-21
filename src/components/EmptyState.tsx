import { Pipette } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="bg-zinc-800 flex grow size-full rounded-2xl">

      <div className="m-auto items-center flex flex-col gap-6 justify-center size-full">
        <Pipette />
        <p className="max-w-2/3 text-center">Click on the video to generate your color palette</p>
      </div>

    </div>
  )
}