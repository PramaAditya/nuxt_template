import { tool } from 'ai';
import { z } from 'zod';
import { create, all } from 'mathjs';

const math = create(all);

export const calculatorTool = tool({
  description: 'A calculator that can evaluate mathematical expressions.',
  inputSchema: z.object({
    expression: z.string().describe('The mathematical expression to evaluate.'),
  }),
  execute: async ({ expression }: { expression: string }) => {
    try {
      const result = math.evaluate(expression);
      console.debug(`[server/tools/calculator.ts] Calculator result: ${result}`);
      return { result };
    } catch (error) {
      console.error(`Calculator error: ${error}`);
      return { error: 'Invalid expression' };
    }
  },
});