import React from "react"
import MediaStreamManager from "./MediaStreamManager"

const defaults = {
  constraints: {
    video: true,
    audio: false,
    facingMode: { exact: "environment" },
  },
  activeCaptureSize: {
    width: 1280,
    height: 720
  },
  size: { dx: 0, dy: 0, width: 0, height: 0 }
};


const asyncRequestAnimationFrame = () => new Promise(res => requestAnimationFrame(id => res(id))); 


const WebcamStream = ({ 
  constraints = defaults.constraints,
  captureSize = defaults.activeCaptureSize, 
  onCapture,
  onPlay,
  onPause,
  onLoadedMetadata,
  ...props 
}) => {
  const $videoRef = React.useRef();

  const mediaStreamContext = React.useMemo(() => {
    return MediaStreamManager.createStreamContext(constraints);
  }, [ constraints ]);

  const startStream = React.useCallback(async () => {
    const stream = await mediaStreamContext.getStream();

    if (stream !== null) {
      $videoRef.current.srcObject = stream;
      $videoRef.current.play();
    }
  }, [ mediaStreamContext ]);

  const stopStream = React.useCallback(() => {
    $videoRef.current.pause();
    $videoRef.current.srcObject = null;
    MediaStreamManager.stopStream(mediaStreamContext.id);
  }, [ mediaStreamContext ]);

  const [ size, setSize ] = React.useState(defaults.size);

  const graphics = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    return canvas;
  }, [ size ]);


  const handleMetadataLoaded = React.useCallback((event) => {
    const videoWidth = event.target.videoWidth;
    const videoHeight = event.target.videoHeight;

    const dx = videoWidth > captureSize.width ? (videoWidth - captureSize.width) / 2 : 0;
    const dy = videoHeight > captureSize.height ? (videoHeight - captureSize.height) / 2 : 0;

    const captureWidth = Math.min(captureSize.width, videoWidth);
    const captureHeight = Math.min(captureSize.height, videoHeight);

    setSize({ 
      dx, dy,
      width: captureWidth,
      height: captureHeight
    });

    typeof(onLoadedMetadata) == 'function' && onLoadedMetadata(event);
  }, [ captureSize, onLoadedMetadata ]);

  const capturing = React.useMemo(() => ({
    status: "idle",
    start: async function() {
      this.status = "running";

      while(this.status === "running") {
        await asyncRequestAnimationFrame();

        if ($videoRef.current && $videoRef.current.readyState > 1 && size.width > 0 && size.height > 0) {
          const context = graphics.getContext("2d");
          context.drawImage($videoRef.current, size.dx, size.dy, size.width, size.height);
          const imageData = context.getImageData(0, 0, size.width, size.height);

          if (typeof(onCapture) === "function") {
            await onCapture(imageData);
          }
        }

      }
    },
    stop: function() {
      this.status = "cancelled";
    }
  }), [ size, graphics, onCapture ]);

  React.useEffect(() => {
    if (capturing.status !== "running") {
      capturing.start();
    }

    return () => capturing.stop();
  }, [ capturing ]);
  

  const handlePlay = (event) => {
    capturing.start();

    typeof(onPlay) == "function" && onPlay(event);
  }

  const handlePause = (event) => {
    capturing.stop();

    typeof(onPause) == "function" && onPause(event);
  }

  React.useLayoutEffect(() => {
    startStream();
    return () => stopStream();
  }, [ mediaStreamContext, startStream, stopStream ]);


  return <video ref={$videoRef} onPlay={handlePlay} onPause={handlePause} onLoadedMetadata={handleMetadataLoaded} {...props} />
};


const envSupportsWebRTC = () => {
  return navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia;
}

const WebcamStreamWrapper = (props) => {
  if (envSupportsWebRTC()) {
    return <WebcamStream {...props} />
  }
  else {
    return null;
  }
};

export default WebcamStreamWrapper;