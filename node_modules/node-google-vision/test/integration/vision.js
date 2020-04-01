'use strict'

const expect = require('chai').expect
const Vision = require('../../vision')
const parameters = require('../../parameters')

const debug = require('debug')('node-google-vision:test:Vision')

const vision = new Vision(parameters.GoogleVision)

const urlImage = 'https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia_wordmark.png'
const runImage = __dirname + '/../images/run.jpg'
const facesImage = __dirname + '/../images/Mark_Zuckerberg_and_wife2.jpg'
const logoImage = __dirname + '/../images/Mark_Zuckerberg2.png'
const textImage = __dirname + '/../images/text.png'
const fullTextImage = __dirname + '/../images/fulltext.png'
const noSafeImage = __dirname + '/../images/volley_beach.jpg'

describe('Vision', function () {
    this.timeout(10000)
    
    it('faceDetection should response ok and have results', async function () {
        const results = await vision.faceDetection(facesImage)
        
        expect(results).to.be.an('array')
        expect(results.length).to.be.equal(2)
        results.forEach(face => {
            expect(face).to.have.property('boundingPoly')
            expect(face.boundingPoly).to.have.property('vertices')
            expect(face).to.have.property('landmarks')
            expect(face).to.have.property('detectionConfidence')
            expect(face).to.have.property('landmarkingConfidence')
        })
    })

    it('safeSearchDetection should response ok and have results', async function () {
        const results = await vision.safeSearchDetection(noSafeImage)
        
        expect(results).to.have.property('adult')
        expect(results).to.have.property('spoof')
        expect(results).to.have.property('medical')
        expect(results).to.have.property('violence')
    })

    it('logoDetection should response ok and have results', async function () {
        const results = await vision.logoDetection(logoImage)
        
        results.forEach(logo => {
            expect(logo).to.have.property('description')
            expect(logo).to.have.property('score')
            expect(logo).to.have.property('confidence')
            expect(logo).to.have.property('boundingPoly')
        })
    })

    it('HTTP image works fine', async function () {
        const results = await vision.logoDetection(urlImage)
        
        results.forEach(logo => {
            expect(logo).to.have.property('description')
            expect(logo).to.have.property('score')
            expect(logo).to.have.property('confidence')
            expect(logo).to.have.property('boundingPoly')
        })
    })

    it('labelDetection should response ok and have results', async function () {
        const results = await vision.labelDetection(runImage)
        
        results.forEach(label => {
            expect(label).to.have.property('description')
            expect(label).to.have.property('score')
            expect(label).to.have.property('confidence')
            expect(label).to.have.property('boundingPoly')
        })
    })

    it('landmarkDetection should response ok and have results', async function () {
        const results = await vision.landmarkDetection(runImage)
        
        results.forEach(landmark => {
            expect(landmark).to.have.property('description')
            expect(landmark).to.have.property('score')
            expect(landmark).to.have.property('confidence')
            expect(landmark).to.have.property('boundingPoly')
            expect(landmark).to.have.property('locations')
            expect(landmark.locations).to.be.an('array')
            landmark.locations.forEach(location => {
                expect(location).to.have.property('latLng')
                expect(location.latLng).to.have.property('latitude')
                expect(location.latLng).to.have.property('longitude')
            })
        })
    })

    it('textDetection should response ok and have results', async function () {
        const results = await vision.textDetection(textImage)
        
        results.forEach(label => {
            expect(label).to.have.property('description')
            expect(label).to.have.property('score')
            expect(label).to.have.property('confidence')
            expect(label).to.have.property('boundingPoly')
        })
    })

    it('imageProperties should response ok and have results', async function () {
        const results = await vision.imageProperties(textImage)

        expect(results).to.have.property('dominantColors')
        expect(results.dominantColors).to.have.property('colors')
        expect(results.dominantColors.colors).to.be.an('array')
        results.dominantColors.colors.forEach(color => {
            expect(color).to.have.property('color')
            expect(color).to.have.property('score')
            expect(color).to.have.property('pixelFraction')
        })
    })

    it('webDetection should response ok and have results', async function () {
        const results = await vision.webDetection(runImage)
    
        expect(results).to.have.property('webEntities')
        expect(results.webEntities).to.be.an('array')
        results.webEntities.forEach(entity => {
            expect(entity).to.have.property('score')
            expect(entity).to.have.property('description')
        })

        expect(results).to.have.property('fullMatchingImages')
        expect(results.fullMatchingImages).to.be.an('array')
        results.fullMatchingImages.forEach(image => {
            expect(image).to.have.property('url')
            expect(image).to.have.property('score')
        })

        expect(results).to.have.property('partialMatchingImages')
        expect(results.partialMatchingImages).to.be.an('array')
        results.partialMatchingImages.forEach(image => {
            expect(image).to.have.property('url')
            expect(image).to.have.property('score')
        })

        expect(results).to.have.property('pagesWithMatchingImages')
        expect(results.pagesWithMatchingImages).to.be.an('array')
        results.pagesWithMatchingImages.forEach(image => {
            expect(image).to.have.property('url')
            expect(image).to.have.property('score')
        })  
    })

    it('documentTextDetection should response ok and have results', async function () {
        const results = await vision.documentTextDetection(fullTextImage)
        
        expect(results).to.have.property('pages')
        expect(results.pages).to.be.an('array')
        expect(results).to.have.property('text')
    })
})