import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface Props {
  classname?: string;
}

export const BackButton = ({ classname }: Props) => {
  const router = useRouter();

  const className = cn("flex items-center", classname);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft />
    </Button>
  );
};
