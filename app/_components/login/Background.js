import Image from "next/image";

export default function Background() {
  return (
    <Image
      alt="GBTAC Building"
      src="/login/loginbackground.jpg"
      quality={100}
      fill
      sizes="100vw"
      style={{
        objectFit: "cover",
      }}
    />
  );
}
