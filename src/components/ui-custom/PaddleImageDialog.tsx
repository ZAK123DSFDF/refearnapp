import { AppDialog } from "@/components/ui-custom/AppDialog"
import { usePaddleImage } from "@/provider/PaddleImageProvider"
import Image from "next/image"
export function PaddleImageDialog() {
  const { dialogOpen, selectedImage, setDialogOpen } = usePaddleImage()

  return (
    <AppDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      affiliate={false}
      showFooter={false}
      title="Preview"
    >
      {selectedImage && (
        <div className="max-h-[85vh] overflow-auto touch-pan-y touch-pan-x">
          <Image
            src={selectedImage}
            alt="Preview"
            width={3000}
            height={2000}
            className="rounded-lg w-full h-auto select-none"
          />
        </div>
      )}
    </AppDialog>
  )
}
