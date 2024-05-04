import cliProgress from "cli-progress";

export const progressBar = new cliProgress.SingleBar(
  {
    format:
      "Generation: [{bar}] {percentage}% | ETA: {eta}s | Task: {nextTask}...",
  },
  cliProgress.Presets.shades_classic
);
