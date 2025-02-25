
import { Button } from "@/components/ui/button";
import { EyeIcon, CodeIcon } from "lucide-react";

interface MarkdownToggleProps {
  isPreview: boolean;
  onToggle: () => void;
}

export const MarkdownToggle = ({ isPreview, onToggle }: MarkdownToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      {isPreview ? (
        <>
          <CodeIcon className="h-4 w-4" />
          Edit
        </>
      ) : (
        <>
          <EyeIcon className="h-4 w-4" />
          Preview
        </>
      )}
    </Button>
  );
};
