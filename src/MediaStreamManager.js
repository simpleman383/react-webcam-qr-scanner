class MediaStreamManager {
  static storage = new Map();

  createStreamContext(constraints) {
    const streamId =  Math.random().toString(16).slice(2);

    MediaStreamManager.storage.set(streamId, {
      stream: null,
      state: "created",
    });

    const getContextStream = async function() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (MediaStreamManager.storage.has(streamId) && MediaStreamManager.storage.get(streamId).state === "cancelled") {
          console.error("Stream already cancelled");
          stream.getVideoTracks().forEach(track => track.stop());
          MediaStreamManager.storage.delete(streamId);
          return null;
        }
        else {
          MediaStreamManager.storage.set(streamId, {
            state: "started",
            stream: stream
          });
          return stream;
        }
      }
      catch (err) {
        console.error("Failed to start a new user media stream");
        MediaStreamManager.storage.delete(streamId);
        return null;
      }
    }
    
    return {
      id: streamId,
      getStream: getContextStream
    };
  }

  stopStream(contextId) {
    if (MediaStreamManager.storage.has(contextId)) {
      const context = MediaStreamManager.storage.get(contextId);

      switch (context.state) {
        case "created": {
          MediaStreamManager.storage.set(contextId, {
            ...context,
            state: "cancelled"
          });
          break;
        }
        case "started": {
          const { stream } = context;
          if (stream !== null) {
            stream.getVideoTracks().forEach(track => track.stop());
          }
          MediaStreamManager.storage.delete(contextId);
          break;
        }
        default:
        case "cancelled": {
          break;
        }
      }
    }
  }
}

const mediaStreamManager = new MediaStreamManager();
export default mediaStreamManager;