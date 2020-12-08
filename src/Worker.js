import jsQR from "jsqr";

self.onmessage = function(event) {
  if (event.data) {
    const { id, content } = event.data;

    switch(content.type) {
      case "ack": {
        self.postMessage({ id, content });
        break;
      }
      case "decode": {
        const { data, width, height } = content.data;
        const result = jsQR(data, width, height);
        self.postMessage({ 
          id: id, 
          content: {
            type: "decode",
            data: result
          }
        });        
        break;
      }
      default:
        break;
    }
  }
}