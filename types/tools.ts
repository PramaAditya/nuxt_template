import { z } from "zod";

const calculatorSchema = z.object({
  expression: z.string().describe("The mathematical expression to evaluate."),
});

export type UITools = {
  calculator: {
    input: z.infer<typeof calculatorSchema>;
    output: { result: number } | { error: string };
  };
};