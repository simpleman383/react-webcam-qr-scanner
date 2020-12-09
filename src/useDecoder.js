import React from "react";
import WorkerInterface from "./WorkerInterface";

const DecoderState = {
  Pending: "pending",
  Worker: "worker",
  Fallback: "fallback",
  MainThread: "main-thread",
  Failed: "failed"
};

const DecoderDefault = {
  decode: () => Promise.resolve(null)
};


export const useDecoder = ({ askTimeout, onLoad }) => {
  const jsQR = React.useRef(null);
  
  const [ state, setState ] = React.useState(DecoderState.Pending);

  const worker = React.useMemo(() => {
    if (typeof(Worker) !== "undefined") {
      return new WorkerInterface();
    }
    else {
      console.warn("Failed to start a Web Worker");
      return null;
    }
  }, []);

  const decoder = React.useMemo(() => {
    switch (state) {
      case DecoderState.Worker:
        return {
          decode: function(imageData) {
            return worker.requestDecoding(imageData);
          }
        };
      case DecoderState.MainThread:
        return {
          decode: function(imageData) {
            return Promise.resolve(jsQR.current(imageData));
          }
        };
      default:
        return DecoderDefault;
    }
  }, [ state, worker, jsQR.current ]);


  const onInit = React.useCallback(async () => {
    try {
      await worker.ack(askTimeout);
      setState(DecoderState.Worker);
      typeof(onLoad) == "function" && onLoad(DecoderState.Worker);
    } 
    catch {
      console.warn("Qr decoding worker does not respond. Trying to setup decoding in the main thread...");
      setState(DecoderState.Fallback);

      try {
        if (typeof(jsQR.current) == "function") {
          setState(DecoderState.MainThread);
          typeof(onLoad) == "function" && onLoad(DecoderState.MainThread);
        }
        else {
          const loadableJsQR = await import("jsqr");
          jsQR.current = loadableJsQR.default;
          setState(DecoderState.MainThread);
        }
      }
      catch (err) {
        console.error("Failed to load script.", err);
        setState(DecoderState.Failed);
      }
    }
  }, [ worker, jsQR.current ]);


  React.useEffect(() => {
    onInit();

    return () => {
      if (worker !== null) {
        worker.onDestroy();
        setState(DecoderState.Pending);
      }
    }
  }, [ worker ]);


  return decoder;
};