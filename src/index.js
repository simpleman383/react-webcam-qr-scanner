import Stream from "./Stream";
import connected from "./Connect";
import PropTypes from "prop-types";

export const setupScanner = options => connected(Stream, { ...options });

const Scanner = connected(Stream, { 
  workerAckTimeout: 3 * 1000,
});

Scanner.propTypes = {
  onDecode: PropTypes.func,
  captureSize: PropTypes.objectOf(PropTypes.number),
  constraints: PropTypes.object,
};

export default Scanner;