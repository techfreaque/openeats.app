import { Heart } from "lucide-react";
import { Button } from "next-vibe-ui/ui";
import type { JSX } from "react";

const LikeButton = ({
  liked,
  toggleLikeClick,
}: {
  liked: boolean;
  toggleLikeClick: () => void;
}): JSX.Element => {
  return (
    <Button
      variant={"ghost"}
      onClick={() => toggleLikeClick()}
      className="rounded-md"
      size={"icon"}
    >
      <Heart
        size={18}
        color={liked ? "#e2475e" : "black"}
        className="text-gray-600"
        fill={liked ? "#e2475e" : "white"}
      />
    </Button>
  );
};

export default LikeButton;
