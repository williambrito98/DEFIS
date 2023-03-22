const { PerfilError } = require('../errors/index')

/**
 *
 * @param {import('puppeteer-core').Page} page
 * @param {string} cnpj
 */
module.exports = async function (page, cnpj) {
  let error = ''
  await page.waitForSelector('#btnPerfil')
  await page.click('#btnPerfil')
  await page
    .click('#formTitular > input.submit')
    .catch((e) => console.log('sem botao titular'))
  await page.waitForTimeout(2500)
  await page.click('#btnPerfil').catch((e) => 'ja esta aberto')
  await page.type('#txtNIPapel2', cnpj)
  await page.click('#formPJ > input.submit')
  await page.waitForTimeout(5000)
  await page.waitForNetworkIdle()
  const dialog = await page
    .$eval(
      'body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.no-close.ui-resizable',
      (element) => element.style.display?.trim()
    )
    .catch((e) => 'sem dialog')
  if (dialog === 'block') {
    console.log('dialog aberto')
    await page.evaluate((item) => {
      document.querySelector(
        'body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.no-close.ui-resizable'
      ).style.display = 'none'
      document.querySelector('body > div.ui-widget-overlay').style.display =
          'none'
    })
  }
  error = await page
    .$eval('#perfilAcesso > div.erro > p', (item) =>
      item.textContent.trim()
    )
    .catch((e) => 'ATENÇÃO:')
  if (error !== 'ATENÇÃO:') {
    throw new PerfilError(error)
  }
  await page.waitForNetworkIdle()
  await page.waitForTimeout(3000)
}
