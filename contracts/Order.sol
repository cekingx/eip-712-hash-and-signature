// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./OrderLib.sol";

contract Order is EIP712 {
  using OrderLib for OrderLib.Order;
  using OrderLib for OrderLib.User;
  using OrderLib for OrderLib.Product;
  using ECDSA for bytes32;

  constructor() EIP712("Order", "1") {}

  function userTypeHash() public pure returns (bytes32) {
    return OrderLib.userTypeHash();
  }

  function hashUser(OrderLib.User memory user) public pure returns (bytes32) {
    return user.hashUser();
  }

  function verifyUser(OrderLib.User memory user, bytes memory signature) public view returns (address) {
    bytes32 userHash = hashUser(user);
    bytes32 digest = _hashTypedDataV4(userHash);
    return digest.recover(signature);
  }

  function productTypeHash() public pure returns (bytes32) {
    return OrderLib.productTypeHash();
  }

  function hashProduct(OrderLib.Product memory product) public pure returns (bytes32) {
    return product.hashProduct();
  }

  function verifyProduct(OrderLib.Product memory product, bytes memory signature) public view returns (address) {
    bytes32 productHash = hashProduct(product);
    bytes32 digest = _hashTypedDataV4(productHash);
    return digest.recover(signature);
  }

  function orderTypeHash() public pure returns (bytes32) {
    return OrderLib.orderTypeHash();
  }

  function hashOrder(OrderLib.Order memory order) public pure returns (bytes32) {
    return order.hashOrder();
  }

  function verifyOrder(OrderLib.Order memory order, bytes memory signature) public view returns (address) {
    bytes32 orderHash = hashOrder(order);
    bytes32 digest = _hashTypedDataV4(orderHash);
    return digest.recover(signature);
  }
}