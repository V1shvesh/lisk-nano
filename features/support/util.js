/* eslint-disable import/no-extraneous-dependencies */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');

chai.use(chaiAsPromised);
const expect = chai.expect;
const EC = protractor.ExpectedConditions;
const waitTime = 5000;

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

function writeScreenShot(data, filename) {
  const stream = fs.createWriteStream(filename);
  stream.write(new Buffer(data, 'base64'));
  stream.end();
}

function takeScreenshot(screnarioSlug, callback) {
  browser.takeScreenshot().then((screenshotBuffer) => {
    if (!fs.existsSync(browser.params.screenshotFolder)) {
      fs.mkdirSync(browser.params.screenshotFolder);
    }
    const screenshotPath = `${browser.params.screenshotFolder}/${screnarioSlug}.png`;
    writeScreenShot(screenshotBuffer, screenshotPath);
    console.log(`Screenshot saved to ${screenshotPath}`); // eslint-disable-line no-console
    if (callback) {
      callback();
    }
  });
}

function waitForElem(selector) {
  return new Promise((resolve, reject) => {
    const elem = element(by.css(selector));
    const stepName = `waiting for element '${selector}'`;
    browser.wait(EC.presenceOf(elem), waitTime, stepName)
      .then(() => resolve(elem))
      .catch(reject);
  });
}

function waitForElemAndCheckItsText(selector, text, callback) {
  waitForElem(selector).then((elem) => {
    expect(elem.getText()).to.eventually.equal(text, `inside element "${selector}"`)
      .and.notify(callback || (() => {}));
  }).catch(error => callback && callback(error));
}

function waitForElemAndMatchItsText(selector, text, callback) {
  waitForElem(selector).then((elem) => {
    expect(elem.getText()).to.eventually.match(new RegExp(text), `inside element "${selector}"`)
      .and.notify(callback || (() => {}));
  }).catch(error => callback && callback(error));
}

function waitForElemRemoved(selector) {
  return new Promise((resolve, reject) => {
    const elem = element(by.css(selector));
    const stepName = `waiting for element '${selector}' not present`;
    browser.wait(EC.not(EC.presenceOf(elem)), waitTime, stepName)
      .then(() => resolve(elem))
      .catch(reject);
  });
}

function waitForElemAndClickIt(selector, callback) {
  waitForElem(selector).then((elem) => {
    elem.click().then(() => {
      if (callback) callback();
    }).catch(callback);
  }).catch(error => callback && callback(error));
}

function waitForElemAndSendKeys(selector, keys, callback) {
  waitForElem(selector).then((elem) => {
    elem.sendKeys(keys).then(() => {
      if (callback) callback();
    });
  }).catch(error => callback && callback(error));
}

function checkAlertDialog(title, text, callback) {
  waitForElemAndCheckItsText('.modal-dialog h1', title);
  waitForElemAndCheckItsText('.modal-dialog .modal-dialog-body', text, () => {
    if (callback) callback();
  });
}

module.exports = {
  waitForElemAndCheckItsText,
  waitForElemAndMatchItsText,
  waitForElemRemoved,
  waitForElemAndClickIt,
  waitForElemAndSendKeys,
  checkAlertDialog,
  waitTime,
  takeScreenshot,
  slugify,
  waitForElem,
};
