/**
 *
 * @param {import('puppeteer-core').Page} page
 * @param {{
 * qtdEmpregadoInicio: string,
 * qtdEmpregadoFim : string,
 * lucroContabil: string,
 * socios : [{
 * cpf: string,
 * rendimento: string,
 * prolabora: string,
 * participacao_socio: string,
 * irrf: string
 * }]
 * }} data
 */
module.exports = async (page, data) => {
  await page.waitForSelector(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(1) > input'
  )
  await page.type(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(1) > input',
    '0'
  )
  await page.type(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(2) > input',
    data.qtdEmpregadoInicio.toString()
  )
  await page.type(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(3) > input',
    data.qtdEmpregadoFim.toString()
  )
  await page.type(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(4) > input',
    data.lucroContabil.toString()
  )
  await page.type(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(5) > input',
    '0'
  )
  await page.type(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(8) > input',
    '0'
  )
  await page.type(
    '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(9) > input',
    '0'
  )
  for (let index = 0; index < data.socios.length; index++) {
    await page.waitForTimeout(1500)
    await page.type(
            `#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(7) > div:nth-child(${
                index + 2
            }) > div.titulo > input.cpf`,
            data.socios[index].cpf
    )
    await page.type(
            `#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(7) > div:nth-child(${
                index + 2
            }) > div.conteudo > div:nth-child(1) > input`,
            data.socios[index].rendimento
    )
    await page.type(
            `#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(7) > div:nth-child(${
                index + 2
            }) > div.conteudo > div:nth-child(2) > input`,
            data.socios[index].prolabore
    )
    await page.type(
            `#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(7) > div:nth-child(${
                index + 2
            }) > div.conteudo > div:nth-child(3) > input`,
            data.socios[index].participacao_socio.replace('%', '')
    )
    await page.type(
            `#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(7) > div:nth-child(${
                index + 2
            }) > div.conteudo > div:nth-child(4) > input`,
            data.socios[index].irrf
    )
    if (data.socios.length !== index + 1) {
      await page.click(
        '#ctl00_conteudo_InfEconEmpConteudo > div:nth-child(7) > p > a'
      )
    }
  }
}
