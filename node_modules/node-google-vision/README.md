# node-google-vision
Google Vision library

## Installation
    npm install node-google-vision

## Use

### Instantiation
```javascript
const Vision = require('node-google-vision')

// Set your Google Cloud credentials
const GoogleParameters = {
    "projectId": "XXX",
    "keyFilename": "./vision-api.json"
}

const vision = new Vision(GoogleParameters)
```

The vision-api.json is the Google Cloud authentication file. [More info (Show: Using a service account)](https://cloud.google.com/vision/docs/auth)

### Methods
```javascript
vision.faceDetection(image)
vision.safeSearchDetection(image) # returns a numeric score. Value range [0, 1]
vision.logoDetection(image)
vision.labelDetection(image)
vision.landmarkDetection(image)
vision.textDetection(image)
vision.imageProperties(image)
vision.webDetection(image)
vision.documentTextDetection(image)
```
The image can be: 
- a local image path
- a HTTP/HTTPS image URL 
- a Google Cloud Storage image URL (gs://bucketName/fileName)


## Test
First of all, you must create a *parameters.json* file and set your Google Cloud parameters. You have an example file *parametrs.json.example*
- cp parameters.json.example parameters.json
- vim parameters.json

Then, you will need to add some images to 'test/images'. Show 'test/integration/vision.js' file

Finally:
- npm install
- npm test

## Requirements
node >= 7.10.0

## Contributing
**You are welcome contribute via pull requests.**

## More info about Google Vision
https://cloud.google.com/vision/
https://googlecloudplatform.github.io/google-cloud-node/#/docs/vision/0.12.0/vision/v1