import QrDecodingWorker from "./qr-decoding.worker.js";

const asyncTimeout = (ms) => new Promise((res, rej) => setTimeout(rej, ms));

class WorkerInterface {
  messages = new Map();

  constructor() {
    this.onReceive = this.onReceive.bind(this);

    this.worker = new QrDecodingWorker();
    this.worker.addEventListener("message", this.onReceive);
  }

  onDestroy() {
    this.worker.removeEventListener("message", this.onReceive);
    this.worker.terminate();
  }
  

  onReceive(event) {
    if (event.data) {
      const { id, content } = event.data;

      if (this.messages.has(id)) {
        const { onResponse } = this.messages.get(id); 
        onResponse(content);
        this.messages.delete(id);
      }
    }
  }

  send(message, timeout = 0) {
    const id = Math.random().toString(16).slice(2);

    const messagePromise = new Promise((resolve) => {
      this.messages.set(id, {
        message: message,
        onResponse: (message) => resolve(message) 
      });
    }); 

    this.worker.postMessage({
      id: id,
      content: message,
    });

    if (timeout > 0) {
      return Promise.race([
        asyncTimeout(timeout),
        messagePromise
      ]);
    }
    else {
      return messagePromise;
    }
  }

  ack(timeout) {
    return this.send({ type: "ack" }, timeout);
  } 

  async requestDecoding(imageData) {
    const response = await this.send({
      type: "decode",
      data: imageData
    });

    if (response !== null) {
      return response.data;
    }
    else {
      return null;
    }
    
  }
}

export default WorkerInterface;