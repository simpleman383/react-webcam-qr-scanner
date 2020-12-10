import jsQR from "jsqr";


function decode(data, width, height) {
  try {
    const result = jsQR(data, width, height);
    return {
      success: true,
      result: result
    };
  } catch (err) {
    console.warn(err);
    
    return {
      success: false,
      result: null
    };
  }
};


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
        const result = decode(data, width, height);
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