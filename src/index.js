import Stream from "./Stream";
import connected from "./Connect";

export default connected(Stream, { workerUrl: "worker.js" });