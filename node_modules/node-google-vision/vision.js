'use strict'

const GoogleVision = require('@google-cloud/vision')
const debug = require('debug')('node-google-vision:Vision')

const keys = {
    faceDetection: 'faceAnnotations',
    safeSearchDetection: 'safeSearchAnnotation',
    logoDetection: 'logoAnnotations',
    labelDetection: 'labelAnnotations',
    landmarkDetection: 'landmarkAnnotations',
    textDetection: 'textAnnotations',
    imageProperties: 'imagePropertiesAnnotation',
    webDetection: 'webDetection',
    documentTextDetection: 'fullTextAnnotation'
}

module.exports = class Vision {
    constructor(GoogleParams) {
        this.visionClient = GoogleVision(GoogleParams)
    }

    async doCall(endpoint, imagePath) {
        return this.visionClient[endpoint](getRequestImageObject(imagePath))
            .then((results) => {
                if (results.length && results[0][keys[endpoint]]) {
                    return results[0][keys[endpoint]]
                }
            })
            .catch((err) => {
                debug('error', endpoint, err)
                return err
            })
    }

    async faceDetection(imagePath) {
        return await this.doCall('faceDetection', imagePath)
    }

    async safeSearchDetection(imagePath) {
        let results = await this.doCall('safeSearchDetection', imagePath)
        for(let type in results) {
            results[type] = safeSearchDetectionConfidence(results[type])
        }

        return results
    }

    async logoDetection(imagePath) {
        return await this.doCall('logoDetection', imagePath)
    }

    async labelDetection(imagePath) {
        return await this.doCall('labelDetection', imagePath)
    }

    async landmarkDetection(imagePath) {
        return await this.doCall('landmarkDetection', imagePath)
    }

    async textDetection(imagePath) {
        return await this.doCall('textDetection', imagePath)
    }

    async imageProperties(imagePath) {
        return await this.doCall('imageProperties', imagePath)
    }

    async webDetection(imagePath) {
        return await this.doCall('webDetection', imagePath)
    }

    async documentTextDetection(imagePath) {
        return await this.doCall('documentTextDetection', imagePath)
    }

}

function getRequestImageObject(imagePath) {
    if (imagePath.indexOf('gs://') === 0 || imagePath.indexOf('http://') === 0 || imagePath.indexOf('https://') === 0) {
        return { source: { imageUri: imagePath } }
    } else {
        return { source: { filename: imagePath } }
    }
}

function safeSearchDetectionConfidence(value) {
    let confidence = 0
    switch (value) {
        case 'VERY_UNLIKELY':
            confidence = 0.2
            break;
        case 'UNLIKELY':
            confidence = 0.4
            break;
        case 'POSSIBLE':
            confidence = 0.6
            break;
        case 'LIKELY':
            confidence = 0.8
            break;
        case 'VERY_LIKELY':
            confidence = 1
            break;

        default:
            break;
    }

    return confidence
}
