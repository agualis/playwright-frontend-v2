import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { readFileSync } from 'fs';

// Inject Web3mock module into page context
const mockWeb3 = async (page: Page, fn: Function) => {
  await page.addInitScript({
    content:
      readFileSync(
        require.resolve('@depay/web3-mock/dist/umd/index.bundle.js'),
        'utf-8'
      ) +
      '\n' +
      `(${fn.toString()})();`,
  });
};

const networkName = 'ethereum';
// const networkName = 'goerli';

test('test wallet connection', async ({ page, context }) => {
  await mockWeb3(page, async () => {
    //@ts-ignore
    Web3Mock.mock({
      blockchain: networkName,
      // Gareth testing account
      accounts: { return: ['0x356226e2f6D49749FD5F0fa5656acF86b20F3485'] },
    });
    // This console.logs belong to the page context so they are rendered in devtools console
    console.log('after window ethereum', window.ethereum);
  });

  await page.goto('http://localhost:8080/#/' + networkName);

  await page.getByRole('button', { name: 'Connect wallet' }).first().click();

  await page.getByRole('button', { name: 'Metamask' }).click();
  expect(await page.getByText('0x3562...3485')).toBeDefined();

  await page
    .getByRole('cell', { name: 'Balancer Boosted Aave USD' })
    .locator('div')
    .nth(1)
    .click();

  await page
    .getByRole('heading', { name: 'Balancer Boosted Aave USD' })
    .click();

  // Go to swap
  await page.getByRole('link', { name: 'Swap' }).click();

  await page.locator('input[name="tokenIn"]').fill('0.1');
  const tokenOut = await page.locator('input[name="tokenOut"]');

  // page.getByText('High price impact');
  await page.getByRole('button', { name: 'Preview' }).click();
  expect(page.getByText('Preview swap')).toBeDefined();
});
