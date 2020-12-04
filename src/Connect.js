import React from "react";
import jsQR from "jsqr";
import WorkerInterface from "./WorkerInterface";


const defaultOptions = {
  workerUrl: "",
  workerAckTimeout: 3 * 1000,
};


const connect = (StreamComponent, { workerUrl, workerAckTimeout } = defaultOptions) => ({ onDecode, ...props }) => {

  const handleDecode = React.useCallback((result) => {
    if (result !== null && typeof(onDecode) == "function") {
      onDecode(result);
    }
  }, [ onDecode ]);

  const [ workerState, setWorkerState ] = React.useState("pending");

  const worker = React.useMemo(() => {
    if (typeof(Worker) !== "undefined") {
      return new WorkerInterface(workerUrl);
    }
    else {
      console.warn("Failed to start a Web Worker");
      return null;
    }
  }, []);


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
    else {
      const { data, width, height } = imageData;
      const result = jsQR(data, width, height);
      handleDecode(result);
    }
  }, [ worker, workerState, handleDecode ]);

  return <StreamComponent onCapture={handleCapture} {...props} />
}


export default connect;