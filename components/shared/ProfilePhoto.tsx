import { Avatar, AvatarImage } from "../ui/avatar";

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-24 w-24",
};

export default function ProfilePhoto({
  src,
  name = "Vibely member",
  size = "md",
}: {
  src?: string;
  name?: string;
  size?: keyof typeof sizes;
}) {
  return (
    <Avatar className={`${sizes[size]} shrink-0 bg-muted`}>
      <AvatarImage src={src || "/default-avatar.png"} alt={name} />
    </Avatar>
  );
}
