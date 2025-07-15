import {tool} from "ai";
import {z} from "zod";

export const cadGenerator = tool({
  description: "Generate a CAD model using an external service",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({query}) => {
    try {

      console.log(`Generating CAD model for query: ${query}`);

      const response = await fetch("http://localhost:8000/api/v1/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({prompt: query}),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        model: `/${data.file_path ? data.file_path.split("/").at(-1) : null}`,
        query,
        error: data.error,
      };
    } catch (error) {
      console.error("Error generating CAD model:", error);
      throw new Error("Failed to generate CAD model");
    }
  },
});
