/**
 *
 * @param {import('puppeteer-core').Page} page
 */
module.exports = async function (page) {
    let certf = await page
        .click(
            "#login-dados-certificado > p:nth-child(2) > input[type=image]",
            {
                clickCount: 2,
            }
        )
        .catch((e) => "certificado salvo");
    if (certf !== "certificado salvo") {
        await page.waitForNetworkIdle();
        await page.waitForSelector("#cert-digital > a");
        await page.click("#cert-digital > a");
    }
};
