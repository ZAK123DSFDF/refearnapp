import MyCustomIcon from "@/components/ui-custom/MyCustomIcon"

interface LogoProps {
  size?: number // for ImageResponse or fixed px usage (35 recommended)
}

export function Logo({ size = 35 }: LogoProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: "100%",
          height: "100%",
          backgroundImage:
            "linear-gradient(to bottom right, #A5C8FF, #7B87FF, #6A4CFF)",
        }}
      >
        <MyCustomIcon
          width="100%"
          height="100%"
          aria-label="Custom application graphic"
        />
      </div>
    </div>
  )
}
