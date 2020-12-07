import React from "react";
import WorkerInterface from "./WorkerInterface";

const defaultOptions = {
  workerAckTimeout: 3 * 1000,
};


const connect = (StreamComponent, { workerAckTimeout } = defaultOptions) => ({ onDecode, ...props }) => {

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

  const [ jsQR, setJsQR ] = React.useState(null);

  React.useEffect(() => {
    if (workerState == "inactive") {
      (async function() {
        try {
          const decoderInstance = await import("jsqr");
          setJsQR(decoderInstance);
        }
        catch (err) {
          console.error(err);
        }
      })();
    }
  }, [ workerState ]);

  const handleWorkerLoad = React.useCallback(async () => {
    try {
      await worker.ack(workerAckTimeout);
      setWorkerState("active");
    } catch(err) {
      console.warn(err);
      setWorkerState("inactive");
    }
  }, [ worker ]);


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
    else if (jsQR !== null) {
      const { data, width, height } = imageData;
      const result = jsQR(data, width, height);
      handleDecode(result);
    } else {
      console.warn("Failed to load a decoder");
    }
  }, [ worker, workerState, handleDecode ]);

  return <StreamComponent onCapture={handleCapture} {...props} />
}


export default connect;