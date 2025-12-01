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
        <Image
          src={selectedImage}
          alt="Preview"
          width={3000}
          height={2800}
          className="rounded-lg w-full h-auto"
        />
      )}
    </AppDialog>
  )
}
