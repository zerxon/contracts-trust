const Token = artifacts.require("TrustToken.sol");
const Sale = artifacts.require("TrustSale.sol");

const tests = require("@daonomic/tests-common");
const expectThrow = tests.expectThrow;
const randomAddress = tests.randomAddress;

contract('TrustSale', function(accounts) {

  let token;
  let sale;

  beforeEach(async function() {
    token = await Token.new(1000);
    sale = await Sale.new(token.address);
    await allow(accounts[0]);
    await allow(sale.address);
    await token.transfer(sale.address, 1000);
  });

  async function allow(address) {
    await token.setWhitelist(address, true);
  }

  async function allowAll() {
    await allow("0x0000000000000000000000000000000000000000");
  }

  it("should sell tokens for eth", async function() {
    await sale.setWhitelist(accounts[1], true);
    await sale.setRate("0x0000000000000000000000000000000000000000", "10000000000000000000");

    await sale.sendTransaction({from: accounts[1], value: 5});
    assert.equal(await token.balanceOf(accounts[1]), 50);
    assert.equal(await token.totalSupply(), 1000);
  })

  it("should not sell if not whitelisted", async function() {
    await sale.setRate("0x0000000000000000000000000000000000000000", "10000000000000000000");

    await expectThrow(
        sale.sendTransaction({from: accounts[1], value: 5})
    );
    assert.equal(await token.balanceOf(accounts[1]), 0);
    assert.equal(await token.totalSupply(), 1000);
  })

});