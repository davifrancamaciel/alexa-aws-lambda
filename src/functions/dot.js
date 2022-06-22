'use strict';

const Alexa = require('ask-sdk-core');
const puppeteer = require('puppeteer');

const s3 = require("../services/AwsS3Service");
const { handlerResponse, handlerErrResponse } = require("../utils/handleResponse");

module.exports.handlerGet = async (event) => {
    return await handleDot()
};

const sleep = async (sec) => {
    const msec = 1000 * sec
    return new Promise(resolve => setTimeout(resolve, msec));
}

const handleDot = async () => {
    try {
        const { bucketName } = process.env
        const DEBUG = true
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://meurh.qualityrhrio.com.br/FrameHTMLQuality/web/app/RH/PortalMeuRH/#/login');
        await sleep(3)

        await page.$eval('input[name=user]', (el, user) => el.value = `${user} `, process.env.USER);
        await page.focus("input[name=user]");
        await page.keyboard.press('Backspace');

        await page.focus("input[name=password]");
        await page.$eval('input[name=password]', (el, pass) => el.value = `${pass} `, process.env.PASSWORD);
        await page.keyboard.press('Backspace');

        await page.$eval('.po-button', el => el.disabled = false);
        await page.click('.po-button');


        await sleep(5)
        const [buttonDot] = await page.$x("//a[contains(., 'Ponto')]");
        if (buttonDot)
            await buttonDot.click();

        await sleep(5)
        const [buttonWatch] = await page.$x("//p[contains(., 'Relógio')]");
        if (buttonWatch)
            await buttonWatch.click();

        await sleep(5)
        const context = browser.defaultBrowserContext()
        await context.overridePermissions("https://meurh.qualityrhrio.com.br/FrameHTMLQuality/web/app/RH/PortalMeuRH/#/timesheet/clockingsGeo/register", ['geolocation'])
        await page.setGeolocation({ latitude: -22.5072996, longitude: -43.1511848 });
        await sleep(2)

        if (!DEBUG) {
            // await page.click('.swipe-button');
            // const mouse = page.mouse;
            // await mouse.down();
            // await mouse.move(126, 19);
            // await sleep(5)
        }
        const screenshot = await page.screenshot();
        const key = `comprovantes/comprovante_${new Date().toISOString()}.png`
        const result = await s3.put(screenshot, key, bucketName);
        const { Location } = result

        await browser.close();
        return handlerResponse(200, { Location })
    } catch (err) {
        return handlerErrResponse(err)
    }
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        await handleDot()
        const speakOutput = 'Ok, seu ponto foi realizado com sucesso. Até a próxima';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();