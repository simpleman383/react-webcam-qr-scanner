import Stream from "./Stream";
import connected from "./Connect";

export const setupScanner = options => connected(Stream, { ...options });

const Scanner = connected(Stream, { 
  workerAckTimeout: 3 * 1000,
});



export default Scanner;