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

    describe("Order", function () {
      it("should get order typehash", async function () {
        const { order } = await loadFixture(deployFixture);

        const orderTypehash = await order.orderTypeHash()
        const orderType = 'Order(User buyer,User seller,uint8 orderType,Product product,uint256 quantity)Product(string name,uint256 price)User(uint256 id,string name,string email)'
        const generatedTypeHash = ethers.keccak256(Buffer.from(orderType))
        expect(orderTypehash).to.equal(generatedTypeHash)
      })

      it("should get order typehash - typed encoder", async function () {
        const { order } = await loadFixture(deployFixture);

        const types = {
          Order: [
            { name: 'buyer', type: 'User' },
            { name: 'seller', type: 'User' },
            { name: 'orderType', type: 'uint8' },
            { name: 'product', type: 'Product' },
            { name: 'quantity', type: 'uint256' }
          ],
          Product: [
            { name: 'name', type: 'string' },
            { name: 'price', type: 'uint256' }
          ],
          User: [
            { name: 'id', type: 'uint256' },
            { name: 'name', type: 'string' },
            { name: 'email', type: 'string' }
          ]
        }

        const orderTypehash = await order.orderTypeHash()
        const typeEncoder = new ethers.TypedDataEncoder(types);
        const generatedTypeHash = ethers.keccak256(Buffer.from(typeEncoder.encodeType('Order')))
        expect(orderTypehash).to.equal(generatedTypeHash)
      })

      it("should hash order", async function () {
        const { order } = await loadFixture(deployFixture);
        const coder = new ethers.AbiCoder()

        const userTypeHash = await order.userTypeHash()
        const encodedBuyer = coder.encode(
          ['bytes32', 'uint256', 'bytes32', 'bytes32'],
          [userTypeHash, 1, ethers.keccak256(Buffer.from('Alice')), ethers.keccak256(Buffer.from('alice@mail.com'))]
        ) 
        const buyerHash = ethers.keccak256(Buffer.from(encodedBuyer.slice(2), 'hex'))
        const encodedSeller = coder.encode(
          ['bytes32', 'uint256', 'bytes32', 'bytes32'],
          [userTypeHash, 2, ethers.keccak256(Buffer.from('Bob')), ethers.keccak256(Buffer.from('bob@mail.com'))]
        )
        const sellerHash = ethers.keccak256(Buffer.from(encodedSeller.slice(2), 'hex'))

        const productTypeHash = await order.productTypeHash()
        const encodedProduct = coder.encode(
          ['bytes32', 'bytes32', 'uint256'],
          [productTypeHash, ethers.keccak256(Buffer.from('Apple')), 100]
        )
        const productHash = ethers.keccak256(Buffer.from(encodedProduct.slice(2), 'hex'))

        const orderTypeHash = await order.orderTypeHash()
        const encodedOrder = coder.encode(
          ['bytes32', 'bytes32', 'bytes32', 'uint8', 'bytes32', 'uint256'],
          [orderTypeHash, buyerHash, sellerHash, 0, productHash, 10]
        )
        const generatedOrderHash = ethers.keccak256(Buffer.from(encodedOrder.slice(2), 'hex'))

        const orderHash = await order.hashOrder({
          buyer: {
            id: 1,
            name: 'Alice',
            email: 'alice@mail.com'
          },
          seller: {
            id: 2,
            name: 'Bob',
            email: 'bob@mail.com'
          },
          orderType: 0,
          product: {
            name: 'Apple',
            price: 100
          },
          quantity: 10
        });

        expect(orderHash).to.equal(generatedOrderHash)
      })

      it("should hash order - typed encoder", async function () {
        const { order } = await loadFixture(deployFixture);

        const types = {
          Order: [
            { name: 'buyer', type: 'User' },
            { name: 'seller', type: 'User' },
            { name: 'orderType', type: 'uint8' },
            { name: 'product', type: 'Product' },
            { name: 'quantity', type: 'uint256' }
          ],
          Product: [
            { name: 'name', type: 'string' },
            { name: 'price', type: 'uint256' }
          ],
          User: [
            { name: 'id', type: 'uint256' },
            { name: 'name', type: 'string' },
            { name: 'email', type: 'string' }
          ]
        }

        const typeEncoder = new ethers.TypedDataEncoder(types);
        const orderValue = {
          buyer: {
            id: 1,
            name: 'Alice',
            email: 'alice@mail.com',
          },
          seller: {
            id: 2,
            name: 'Bob',
            email: 'bob@mail.com',
          },
          orderType: 0,
          product: {
            name: 'Apple',
            price: 100
          },
          quantity: 10
        }
        const encodedOrder = typeEncoder.encodeData('Order', orderValue)
        const generatedOrderHash = ethers.keccak256(Buffer.from(encodedOrder.slice(2), 'hex'))

        const orderHash = await order.hashOrder(orderValue)
        expect(orderHash).to.equal(generatedOrderHash)
      })

      it("should verify order signature", async function () {
        const { order, signer } = await loadFixture(deployFixture);

        const domain = {
          name: 'Order',
          version: '1',
          chainId: 31337,
          verifyingContract: await order.getAddress()
        }

        const types = {
          Order: [
            { name: 'buyer', type: 'User' },
            { name: 'seller', type: 'User' },
            { name: 'orderType', type: 'uint8' },
            { name: 'product', type: 'Product' },
            { name: 'quantity', type: 'uint256' }
          ],
          Product: [
            { name: 'name', type: 'string' },
            { name: 'price', type: 'uint256' }
          ],
          User: [
            { name: 'id', type: 'uint256' },
            { name: 'name', type: 'string' },
            { name: 'email', type: 'string' }
          ]
        }

        const orderValue = {
          buyer: {
            id: 1,
            name: 'Alice',
            email: 'alice@mail.com',
          },
          seller: {
            id: 2,
            name: 'Bob',
            email: 'bob@mail.com',
          },
          orderType: 0,
          product: {
            name: 'Apple',
            price: 100
          },
          quantity: 10
        }

        const signature = await signer.signTypedData(domain, types, orderValue);
        const recoveredOrder = await order.verifyOrder(orderValue, signature)
        expect(recoveredOrder).to.equal(await signer.getAddress())
      })
    })
  })
})