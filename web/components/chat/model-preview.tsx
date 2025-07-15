import { Loader2 } from "lucide-react";

export function ModelPreview({ args }: { args?: any }) {
  return (
    <div className="border rounded-lg h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />

        <div className="flex flex-col gap-2 w-full">
          <p>Generating model...</p>
          <p className="text-sm text-muted-foreground">{args.query}</p>
        </div>
      </div>
    </div>
  );
}
