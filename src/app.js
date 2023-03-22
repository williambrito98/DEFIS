const makeBrowser = require('./factories/makeBrowser')
const makePage = require('./factories/makePage')
const loginEcac = require('./pages/loginEcac')
const { WrongUserKey, PerfilError, ZeroBalance, DefisAntigoError, DefisAnosAnterioresFaltantes, SemBotaoDeclararError } = require('./errors')
const alterarPerfil = require('./pages/alterarPerfil')
const setMEEPP = require('./pages/setMEEPP')

/**
 *
 * @param {{values : Array, __root_dir : string}} data
 * @param {import('../selectors.json')} selectors
 * @param {Function(string)} log
 */
module.exports = async (data, selectors, log) => {
  try {
    let browser, page, index, pageDefis;
    ({ browser } = await makeBrowser())
    try {
      ({ page } = await makePage(browser))
      await page.goto(selectors.site_url, { waitUntil: 'networkidle0' })
      await loginEcac(page)
      for (const [apelido, dados] of Object.entries(data.values)) {
        const CNPJ = dados.cpf_cnpj?.toString().replace(/\.|\/|-/, '')
        await alterarPerfil(page, CNPJ)
        await page.click(selectors.simples_nacional)

        await page.waitForTimeout(2500)
        const isDefis2018 = await page.$eval(
          '#containerServicos266',
          (item) => item.textContent
        )
        if (!isDefis2018.includes('PGDAS-D e Defis 2018')) {
          throw new DefisAntigoError('DEFIS ANTIGO')
        }

        pageDefis = await browser.newPage()
        pageDefis.on('dialog', async (dialog) => {
          await dialog.dismiss()
        })

        await pageDefis.goto(selectors.url_pgdas, { waitUntil: 'networkidle0' })

        await pageDefis.goto(selectors.url_defis, { waitUntil: 'networkidle0' })

        await pageDefis.click('input[value=\'2022\']')

        await pageDefis.click('#ctl00_conteudo_lnkContinuar')

        await pageDefis.waitForNetworkIdle()

        const btnDeclarar = await pageDefis.$eval('#ctl00_MenuApln0 > table > tbody > tr > td > a', element => element.textContent.trim())
        console.log(btnDeclarar)
        if (btnDeclarar !== 'Declarar') {
          throw new SemBotaoDeclararError('Não foi possivel realizar a declaração, o botão de declarar não está disponivel')
        }

        await pageDefis.click('#ctl00_MenuApln0 > table > tbody > tr > td > a')
        await pageDefis.waitForNetworkIdle()
        await pageDefis.waitForSelector('#ctl00_conteudo_AnoCalendario')
        await pageDefis.click('#ctl00_conteudo_AnoCalendario').then(e => console.log('Retificado'))
        await pageDefis.click('#ctl00_conteudo_AnoRetCalendario').then(e => console.log('original'))
        await pageDefis.click('#ctl00_conteudo_lnkContinuar')

        await pageDefis.waitForSelector('#ctl00_conteudo_TrvDASNn1')
        await pageDefis.click('#ctl00_conteudo_TrvDASNn1')

        await pageDefis.click('#ctl00_conteudo_TrvDASNt2')

        await setMEEPP(pageDefis, {
          lucroContabil: dados.lucro_contabil,
          qtdEmpregadoFim: dados.qtd_empregados_fim,
          qtdEmpregadoInicio: dados.qtd_empregados_inicio,
          socios: dados.socios
        })

        index = apelido

        await pageDefis.close()
      }

      // await browser.close()
      return {
        status: true
      }
    } catch (error) {
      await pageDefis.close().catch(e => '')
      await page.close()

      log(error)
      if (error instanceof WrongUserKey) {
        log('Erro ao enviar o usuario para o serviço de captcha')
        return {
          status: true,
          continue: false,
          error: error.message
        }
      }
      if (error instanceof ZeroBalance) {
        log('Erro ao descriptografar captcha: não a saldo disponivel')
        return {
          status: true,
          continue: false,
          error: error.message,
          lastIndex: index
        }
      }

      if (error instanceof PerfilError) {
        log('Erro ao trocar de perfil')
        return {
          status: false,
          continue: false,
          error: error?.message,
          lastIndex: index
        }
      }

      if (error instanceof DefisAntigoError) {
        log('Erro: Defis Antigo')
        return {
          status: false,
          continue: false,
          error: error?.message,
          lastIndex: index
        }
      }

      if (error instanceof DefisAnosAnterioresFaltantes) {
        log(error?.message)
        return {
          status: false,
          continue: false,
          error: error?.message,
          lastIndex: index
        }
      }

      if (error instanceof SemBotaoDeclararError) {
        log(error.message)
        return {
          status: false,
          continue: false,
          error: error.message,
          lastIndex: index
        }
      }
      log(error)
      return {
        status: false,
        continue: true,
        repeat: true,
        lastIndex: index,
        error: error?.message
      }
    }
  } catch (error) {
    log(error)
    return {
      status: false,
      continue: false,
      error: error?.message
    }
  }
}
