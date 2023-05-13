import { TaskExecutor } from "yajsapi";

(async function main() {
  const text2speak = "I have completed the task 1 of Golem JS preview program!";
  const executor = await TaskExecutor.create("32f9b13b35f51a45421b85b1bb674d910b85f8cf6233bdccdc7ea099");
  await executor.run(async (ctx) => {
    // DONE execute espeak command
    const result = await ctx.run(`espeak "${text2speak}" -w /golem/output/result.wav && ffmpeg -y -i /golem/output/result.wav /golem/output/result.mp3`);
    if (result.result === "Ok") {
      await ctx.downloadFile("/golem/output/result.mp3", "result.mp3");
    }
  });
  await executor.end();
})();
