import { Color } from "@/types"
import { rgbToHex } from "@/utils"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip"

interface Props {
  userColors: Color[]
}

export default function ColorPalette(props: Props) {

  const { userColors } = props

  return (
    <div className="flex flex-col w-full gap-8 text-zinc-400">
      <div >
        <div className="flex flex-col gap-4">
          <h2 className="mt-8 font-semibold text-lg">Your colors</h2>
          <div
            className="flex flex-wrap gap-2 text-zinc-600 font-mono">

            {
              userColors && userColors.map((color, index) => {
                const hexCode = rgbToHex(color?.r ?? 0, color?.g ?? 0, color?.b ?? 0)

                return (

                  <TooltipProvider
                    delayDuration={100}
                  >
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          key={`${index} +${color.r}  `}
                          className="cursor-pointer flex grow flex-row gap-2 items-center border-1 border-zinc-800 hover:bg-zinc-800 rounded-full px-2 py-1 transition-all"
                          onClick={() => { navigator.clipboard.writeText(hexCode) }}
                        >
                          <div
                            className="size-4 rounded-full"
                            style={{ backgroundColor: hexCode }}>
                          </div>

                          <p className="text-sm">{hexCode}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="bg-zinc-800 px-2 py-0.5 rounded-2xl">
                          <p className="text-xs">Tap to copy</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )

              })
            }
          </div>
        </div>

      </div>



    </div>
  )
}