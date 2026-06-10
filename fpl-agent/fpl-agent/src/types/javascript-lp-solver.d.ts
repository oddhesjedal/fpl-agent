// javascript-lp-solver ships no type declarations; declare a minimal surface.
declare module "javascript-lp-solver" {
  interface Model {
    optimize: string;
    opType: string;
    constraints: Record<string, { equal?: number; min?: number; max?: number }>;
    variables: Record<string, Record<string, number>>;
    binaries?: Record<string, number>;
    ints?: Record<string, number>;
  }

  interface Solution {
    feasible: boolean;
    result: number;
    bounded: boolean;
    [variable: string]: number | boolean;
  }

  const solver: {
    Solve: (model: Model) => Solution;
  };

  export default solver;
}
