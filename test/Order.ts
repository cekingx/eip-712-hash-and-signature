import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Order", function () {
  async function deployFixture() {
    const [signer] = await ethers.getSigners();

    const Order = await ethers.getContractFactory("Order");
    const order = await Order.deploy();

    return { order, signer };
  }

  describe("Deployment", function () {

    describe("User", function () {
      it("should get user typehash", async function () {
        const { order } = await loadFixture(deployFixture);

        const userTypehash = await order.userTypeHash()
        const generatedTypeHash = ethers.keccak256(Buffer.from('User(uint256 id,string name,string email)'))
        expect(userTypehash).to.equal(generatedTypeHash)
      })

      it("should hash user", async function () {
        const { order } = await loadFixture(deployFixture);

        const userTypeHash = await order.userTypeHash()
        const coder = new ethers.AbiCoder()
        const encoded = coder.encode(
          ['bytes32', 'uint256', 'bytes32', 'bytes32'],
          [userTypeHash, 1, ethers.keccak256(Buffer.from('Alice')), ethers.keccak256(Buffer.from('alice@mail.com'))]
        ) 
        const generatedUserHash = ethers.keccak256(Buffer.from(encoded.slice(2), 'hex'))
        const userHash = await order.hashUser({
          id: 1,
          name: 'Alice',
          email: 'alice@mail.com'
        })
        expect(userHash).to.equal(generatedUserHash)
      })

      it("should verify user signature", async function () {
        const { order, signer } = await loadFixture(deployFixture);

        const domain = {
          name: 'Order',
          version: '1',
          chainId: 31337,
          verifyingContract: await order.getAddress()
        }

        const types = {
          User: [
            { name: 'id', type: 'uint256' },
            { name: 'name', type: 'string' },
            { name: 'email', type: 'string' }
          ]
        }

        const user = {
          id: 1,
          name: 'Alice',
          email: 'alice@mail.com'
        }

        const signature = await signer.signTypedData(domain, types, user);
        const recoveredUser = await order.verifyUser(user, signature)
        expect(recoveredUser).to.equal(await signer.getAddress())
      })
    })

    describe("Product", function () {
      it("should get product typehash", async function () {
        const { order } = await loadFixture(deployFixture);

        const productTypehash = await order.productTypeHash()
        const generatedTypeHash = ethers.keccak256(Buffer.from('Product(string name,uint256 price)'))
        expect(productTypehash).to.equal(generatedTypeHash)
      })

      it("should hash product", async function () {
        const { order } = await loadFixture(deployFixture);

        const productTypeHash = await order.productTypeHash()
        const coder = new ethers.AbiCoder()
        const encoded = coder.encode(
          ['bytes32', 'bytes32', 'uint256'],
          [productTypeHash, ethers.keccak256(Buffer.from('Apple')), 100]
        ) 
        const generatedProductHash = ethers.keccak256(Buffer.from(encoded.slice(2), 'hex'))
        const productHash = await order.hashProduct({
          name: 'Apple',
          price: 100
        })
        expect(productHash).to.equal(generatedProductHash)
      })

      it("should verify product signature", async function () {
        const { order, signer } = await loadFixture(deployFixture);

        const domain = {
          name: 'Order',
          version: '1',
          chainId: 31337,
          verifyingContract: await order.getAddress()
        }

        const types = {
          Product: [
            { name: 'name', type: 'string' },
            { name: 'price', type: 'uint256' }
          ]
        }

        const product = {
          name: 'Apple',
          price: 100
        }

        const signature = await signer.signTypedData(domain, types, product);
        const recoveredProduct = await order.verifyProduct(product, signature)
        expect(recoveredProduct).to.equal(await signer.getAddress())
      })
    })

    describe("Order", function () {})


  })
})