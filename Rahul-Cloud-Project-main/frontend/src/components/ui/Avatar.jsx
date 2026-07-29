import { initials, avatarColor } from "../../utils/helpers";

const SIZES = {
  xs:  "w-6 h-6 text-[10px]",
  sm:  "w-8 h-8 text-xs",
  md:  "w-9 h-9 text-sm",
  lg:  "w-12 h-12 text-base",
  xl:  "w-16 h-16 text-xl",
};

export default function Avatar({ name = "", size = "md" }) {
  return (
    <div
      className={`
        ${SIZES[size]} ${avatarColor(name)}
        rounded-full flex items-center justify-center
        font-semibold flex-shrink-0 select-none
      `}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
