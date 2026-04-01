import Image from "next/image";
/**
 * Background component
 *
 * Renders a full-screen background image for the login page.
 * Uses Next.js `fill` mode with `object-cover` to scale the image
 * across all screen sizes without distortion.
 *
 * Note:
 * - Parent container must have `position: relative`, `absolute`, or `fixed`
 * - The image covers its parent container entirely
 *
 * @returns A full-coverage Next.js Image element
 *
 * @author Frontend Developer: [Cintya Lara Flores]
 */
export default function Background() {
  return (
    <Image
      alt="GBTAC Building"
      src="/login/IMG_1439.jpg"
      quality={100}
      fill
      className="object-cover"
    />
  );
}
