class MediaStreamManager {
  static storage = new Map();

  createStreamContext(constraints) {
    const streamId =  Math.random().toString(16).slice(2);

    MediaStreamManager.storage.set(streamId, {
      stream: null,
      state: "created",
    });


    MediaStreamManager.storage.forEach((context, contextId) => {
      if (context.state == "cancelled") {
        MediaStreamManager.storage.delete(contextId);
      }
    });

    const getContextStream = async function() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (MediaStreamManager.storage.has(streamId)) {
          const context = MediaStreamManager.storage.get(streamId);

          if (context.state === "cancelled") {
            console.warn(`MediaStreamManager: stream ${streamId} already cancelled`);

            if (stream !== null) {
              stream.getVideoTracks().forEach(track => track.stop());
            }
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
        else {
          console.warn(`MediaStreamManager: stream ${streamId} probably already cancelled`);

          if (stream !== null) {
            stream.getVideoTracks().forEach(track => track.stop());
          }
          return null;
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
        case "started": {
          const { stream } = context;
          if (stream !== null) {
            stream.getVideoTracks().forEach(track => track.stop());
          }
          MediaStreamManager.storage.delete(contextId);
          break;
        }
        case "created":
        case "cancelled":
        default: {
          MediaStreamManager.storage.delete(contextId);
          break;
        }
      }
    }
  }
}

const mediaStreamManager = new MediaStreamManager();
export default mediaStreamManager;