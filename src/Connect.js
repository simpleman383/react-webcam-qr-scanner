import React from "react";
import WorkerInterface from "./WorkerInterface";
import PropTypes from "prop-types";

const defaultOptions = {
  workerAckTimeout: 3 * 1000,
};

const connect = (StreamComponent, { workerAckTimeout } = defaultOptions) => {

  const ConnectedScanner = ({ onDecode, onScannerLoad, ...props }) => {
    const handleDecode = React.useCallback((result) => {
      if (result !== null && typeof(onDecode) == "function") {
        onDecode(result);
      }
    }, [ onDecode ]);
  
    const [ workerState, setWorkerState ] = React.useState("pending");
  
    const worker = React.useMemo(() => {
      if (typeof(Worker) !== "undefined") {
        return new WorkerInterface();
      }
      else {
        console.warn("Failed to start a Web Worker");
        return null;
      }
    }, []);
  
    const [ mainDecoder, setMainDecoder ] = React.useState(null);
  
    const handleWorkerLoad = React.useCallback(async () => {
      try {
        await worker.ack(workerAckTimeout);
        setWorkerState("active");
        typeof(onScannerLoad) == "function" && onScannerLoad();
      } catch(err) {
        console.warn(err);
        setWorkerState("inactive");
  
        try {
          const loadableJsQR = await import("jsqr");
          setMainDecoder({ decode: loadableJsQR.default });
          typeof(onScannerLoad) == "function" && onScannerLoad();
        } catch (err) {
          console.error(err);
        }
      }
    }, [ worker, onScannerLoad ]);
  
    React.useEffect(() => {
      handleWorkerLoad();
  
      return () => {
        if (worker !== null) {
          setWorkerState("pending");
          worker.onDestroy();
        }
      }
    }, [ worker, handleWorkerLoad ]);
  
  
    const handleCapture = React.useCallback(async (imageData) => {
      if (worker !== null && workerState !== "inactive") {
        const result = await worker.requestDecoding(imageData);
        handleDecode(result);
      }
      else if (mainDecoder !== null) {
        const { data, width, height } = imageData;
        const result = mainDecoder.decode(data, width, height);
        handleDecode(result);
      }
    }, [ mainDecoder, worker, workerState, handleDecode ]);
  
    return <StreamComponent onCapture={handleCapture} {...props} />
  };

  ConnectedScanner.propTypes = {
    onDecode: PropTypes.func,
    onScannerLoad: PropTypes.func,
    captureSize: PropTypes.objectOf(PropTypes.number),
    constraints: PropTypes.object,
  };

  return ConnectedScanner;
}


export default connect;