const puppeteer = require('puppeteer-core')
const { readdirSync } = require('fs')
const { setTimeout } = require('timers/promises')
const { getEnv } = require('../env')

class PuppeteerAdapter {
  /**
    * @param config {import('puppeteer-core').LaunchOptions & import('puppeteer-core').BrowserConnectOptions & import('puppeteer-core').BrowserLaunchArgumentOptions}
    * @returns {import('puppeteer-core').Browser}
    */
  async handleBrowser (config) {
    if (global.browser) return global.browser
    // global.browser = await puppeteer.launch(config)

    global.browser = await puppeteer.connect({
      browserWSEndpoint:
      'ws://127.0.0.1:9222/devtools/browser/aa05aa55-9288-4062-8793-2f490c5697fe',
      slowMo: config.slowMo,
      ignoreHTTPSErrors: config.ignoreHTTPSErrors,
      defaultViewport: config.defaultViewport
    })

    return global.browser
  }

  /**
    * @param config {import('puppeteer-core').LaunchOptions & import('puppeteer-core').BrowserConnectOptions & import('puppeteer-core').BrowserLaunchArgumentOptions}
    * @param browser {import('puppeteer-core').Browser}
    * @returns {import('puppeteer-core').Page}
    */
  async handlePage (browser, config) {
    const page = await browser.newPage()

    page.setDefaultTimeout(config.defaultTimeout)
    page.setDefaultNavigationTimeout(config.defaultNavigationTimeout)

    await page.setViewport(config.defaultViewport)

    config.pathDownload ? await this.setDownloadDirectory(config.pathDownload, page) : ''

    page.setDownloadDirectory = this.setDownloadDirectory
    page.waitForDownload = this.waitForDownload
    page.clearAllCookies = this.clearAllCookies

    return page
  }

  /**
   *
   * @param path  {string}
   * @param page  {import('puppeteer-core').Page}
   */
  async setDownloadDirectory (path, page) {
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      downloadPath: path,
      behavior: 'allow'
    })
  }

  async clearAllCookies (page) {
    const client = await page.target().createCDPSession()
    await client.send('Network.clearBrowserCookies')
  }

  async waitForDownload (pathDownload) {
    let wasDownload = false
    let string = ''
    while (wasDownload === false) {
      string = readdirSync(pathDownload).join('')
      if (!string.includes('crdownload')) {
        if (getEnv('FILE_NAME_DOWNLOAD') && !string.includes(getEnv('FILE_NAME_DOWNLOAD'))) {
          await setTimeout(1500)
          continue
        }
        wasDownload = true
        continue
      }
    }
  }
}

module.exports = PuppeteerAdapter
