import React from "react"
import MediaStreamManager from "./MediaStreamManager"

const defaults = {
  constraints: {
    audio: false,
    video: {
      facingMode: "environment"
    },
  },
  activeCaptureSize: {
    width: 1280,
    height: 720
  },
  size: {
    video: { width: 0, height: 0 },
    capture: { dx: 0, dy: 0, width: 0, height: 0 }
  }
};


const asyncRequestAnimationFrame = () => new Promise(res => requestAnimationFrame(id => res(id))); 


const WebcamStream = React.forwardRef(({ 
  constraints = defaults.constraints,
  captureSize = defaults.activeCaptureSize, 
  onCapture,
  onPlay,
  onPause,
  onLoadedMetadata,
  ...props 
}, ref) => {
  const $videoRef = React.useRef(null);

  React.useImperativeHandle(ref, () => $videoRef.current);

  const [ visible, setVisible ] = React.useState(true);

  const videoState = React.useRef("paused");
  const updateState = React.useCallback((nextState) => {
    videoState.current = nextState;
  }, []);

  const mediaStreamContext = React.useMemo(() => {
    return MediaStreamManager.createStreamContext(constraints);
  }, [ constraints, visible ]);

  const startStream = React.useCallback(async () => {
    updateState("loading");
    const stream = await mediaStreamContext.getStream();

    if (stream !== null && $videoRef.current) {
      $videoRef.current.srcObject = stream;
      $videoRef.current.playsInline = true;
      $videoRef.current.muted = true;
      $videoRef.current.disablePictureInPicture = true;
  
      await $videoRef.current.play();
      updateState("playing");
    }
    else {
      updateState("error");
      MediaStreamManager.stopStream(mediaStreamContext.id);
    }
  }, [ mediaStreamContext ]);

  const stopStream = React.useCallback(async () => {
    $videoRef.current.pause();
    MediaStreamManager.stopStream(mediaStreamContext.id);
    updateState("paused");
  }, [ mediaStreamContext ]);

  const [ size, setSize ] = React.useState(defaults.size);

  const graphics = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size.capture.width;
    canvas.height = size.capture.height;
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
      video: {
        width: videoWidth,
        height: videoHeight
      }, 
      capture: {
        dx, dy,
        width: captureWidth,
        height: captureHeight
      },
    });

    typeof(onLoadedMetadata) == 'function' && onLoadedMetadata(event);
  }, [ captureSize, onLoadedMetadata ]);

  const capturing = React.useMemo(() => ({
    status: "idle",
    start: async function() {
      this.status = "running";

      while(this.status === "running") {
        await asyncRequestAnimationFrame();

        if ($videoRef.current && $videoRef.current.readyState > 1 && size.video.width > 0 && size.video.height > 0) {
          const context = graphics.getContext("2d");
          context.drawImage($videoRef.current, size.capture.dx, size.capture.dy, size.capture.width, size.capture.height, 0, 0, size.capture.width, size.capture.height);
          const imageData = context.getImageData(0, 0, size.capture.width, size.capture.height);

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

  const handleVisibilityChange = React.useCallback((event) => {
    setVisible(!Boolean(event.target.hidden));
  }, []);

  React.useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }

  }, [ handleVisibilityChange ]);

  React.useLayoutEffect(() => {
    if (visible) {
      if (videoState.current === "paused") {
        startStream();
      }
    }
    else {
      if (videoState.current === "playing") {
        stopStream();
      }
    }

    return () => {
      stopStream();
    };
  }, [ mediaStreamContext, visible, startStream, stopStream ]);


  return <video ref={$videoRef} onPlay={handlePlay} onPause={handlePause} onLoadedMetadata={handleMetadataLoaded} {...props} />
});


const envSupportsWebRTC = () => {
  return navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia;
}


const WebcamStreamWrapper = (props, ref) => {
  const { 
    constraints, 
    captureSize,
    onCapture, 
    ...rest 
  } = props;

  if (envSupportsWebRTC()) {
    return <WebcamStream ref={ref} constraints={constraints} captureSize={captureSize} onCapture={onCapture} {...rest} />
  }
  else {
    return <video ref={ref} {...rest} />;
  }
};

export default React.forwardRef(WebcamStreamWrapper);