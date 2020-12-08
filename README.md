# React webcam QR-scanner
An implementation of a real-time QR-code scanner using WebRTC

* Based on jsQR Library
* Properly disposable resources (MediaStream)
* Web worker support (for the detection process)
* Fallback to main thread supported
* Implemented as a pure React component



## Installation

Using [NPM](https://www.npmjs.com/):

```batch
npm install react-webcam-qr-scanner
```

Using [Yarn](https://yarnpkg.com/):

```batch
yarn add react-webcam-qr-scanner
```



### Usage

Here is an example of a simple React component that utilizes ```react-webcam-qr-scanner```

```javascript
import React from "react";
import Scanner from "react-webcam-qr-scanner";

const MyAwesomeComponent = (props) => {

  const handleDecode = (result) => {
    console.log(result);
  } 

  return (
    <Scanner 
      className="some-classname"
      onDecode={handleDecode}
      constraints={{ audio: false, video: true, facingMode: { exact: "environment" } }}
      captureSize={{ width: 1280, height: 720 }}
    />
  );
}

```


### Props

Most of the props are identical to the React \<video\> tag (e.g. classname, name, id, event handlers etc). 
However, some of them define the decoder behaviour and can be set as follows:

Property | Type | Meaning
---------|------|--------
onDecode | function | a callback which fires when a QR-code is successfully decoded
onScannerLoad | function | a callback which fires when QR-decoding script is successfully loaded
constraints | object | a [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints) object
captureSize | object  ```{ width: number, height: number }``` |  Represents the size of the frame area sensitive for QR-detection
 
 
### License

This package is licensed under [MIT](https://opensource.org/licenses/MIT)


### Feedback

I'm also open to new suggestions for improving this package. Contacts: simpleman383@gmail.com

