import React from "react";
import { useDecoder } from "./useDecoder";

const defaultOptions = {
  workerAckTimeout: 3 * 1000,
};

const connect = (StreamComponent, { workerAckTimeout } = defaultOptions) => {

  const ConnectedScanner = ({ onDecode, onScannerLoad, ...props }, ref) => {
    const decoder = useDecoder({ workerAckTimeout, onLoad: onScannerLoad });

    const handleDecode = React.useCallback((result) => {
      if (result !== null && typeof(onDecode) == "function") {
        onDecode(result);
      }
    }, [ onDecode ]);


    const mounted = React.useRef(false);
    React.useEffect(() => {
      mounted.current = true;

      return () => {
        mounted.current = false;
      }
    }, []);
    
  
    const handleCapture = React.useCallback(async (imageData) => {
      const result = await decoder.decode(imageData);
      if (Boolean(mounted.current)) {
        handleDecode(result);
      }
    }, [ decoder, handleDecode ]);
  
    return <StreamComponent ref={ref} onCapture={handleCapture} {...props} />
  };

  return React.forwardRef(ConnectedScanner);
}


export default connect;