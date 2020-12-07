import Stream from "./Stream";
import connected from "./Connect";

export const setupScanner = options => connected(Stream, { ...options });
export default connected(Stream, { workerAckTimeout: 3000 });