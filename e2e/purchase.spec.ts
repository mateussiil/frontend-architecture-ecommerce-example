import { expect, test } from '@playwright/test'

test('comprar um produto: catálogo → carrinho → checkout → pedido confirmado', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('article', { name: 'Caneca de Cerâmica' }).getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await page.getByRole('article', { name: 'Caneca de Cerâmica' }).getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await expect(page.getByRole('link', { name: 'Carrinho (2)' })).toBeVisible()

  await page.getByRole('link', { name: 'Carrinho (2)' }).click()
  await page.getByRole('link', { name: 'Finalizar compra' }).click()

  await page.getByLabel(/Expresso/).check()
  await page.getByLabel('Cupom').fill('bemvindo10')
  await page.getByRole('button', { name: 'Aplicar cupom' }).click()
  // 2 × R$ 40,50 = R$ 81,00 − 10% + R$ 39,90
  await expect(page.getByLabel('Total')).toHaveText(/112,80/)

  await page.getByLabel('Rua').fill('Rua das Flores')
  await page.getByLabel('Número').fill('100')
  await page.getByLabel('Cidade').fill('Porto Alegre')
  await page.getByLabel('CEP').fill('90000-000')
  await page.getByLabel('Cartão').fill('4242 4242 4242 4242')
  await page.getByRole('button', { name: 'Fechar pedido' }).click()

  await expect(page.getByText('Confirmado')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Carrinho (0)' })).toBeVisible()
})

test('o carrinho não deixa passar do estoque', async ({ page }) => {
  await page.goto('/#/products/tenis')

  await page.getByLabel('Quantidade').fill('5')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()

  await expect(page.getByRole('alert')).toHaveText(/Só temos 3 unidade/)
  await expect(page.getByRole('link', { name: 'Carrinho (0)' })).toBeVisible()
})

test('pagamento recusado mantém o carrinho e mostra o motivo', async ({ page }) => {
  await page.goto('/#/products/camiseta')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await page.goto('/#/checkout')

  await page.getByLabel(/Padrão/).check()
  await page.getByLabel('Rua').fill('Rua A')
  await page.getByLabel('Número').fill('1')
  await page.getByLabel('Cidade').fill('Recife')
  await page.getByLabel('CEP').fill('50000000')
  await page.getByLabel('Cartão').fill('4000 0000 0000 0002')
  await page.getByRole('button', { name: 'Fechar pedido' }).click()

  await expect(page.getByRole('alert')).toHaveText(/Pagamento recusado/)
  await expect(page.getByRole('link', { name: 'Carrinho (1)' })).toBeVisible()
})
