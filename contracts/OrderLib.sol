// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

library OrderLib {
  struct User {
    uint256 id;
    string name;
    string email;
  }

  struct Product {
    string name;
    uint256 price;
  }

  enum OrderType {
    PRODUCT,
    SERVICE
  }

  struct Order {
    User buyer;
    User seller;
    OrderType orderType;
    Product product;
    uint256 quantity;
  }

  function userTypeHash() internal pure returns (bytes32) {
    return keccak256("User(uint256 id,string name,string email)");
  }

  function hashUser(User memory user) internal pure returns (bytes32) {
    bytes32 typeHash = userTypeHash();
    bytes memory encoded = abi.encode(
      typeHash,
      user.id,
      keccak256(bytes(user.name)),
      keccak256(bytes(user.email))
    );
    return keccak256(encoded);
  }

  function productTypeHash() internal pure returns (bytes32) {
    return keccak256("Product(string name,uint256 price)");
  }

  function hashProduct(Product memory product) internal pure returns (bytes32) {
    bytes32 typeHash = productTypeHash();
    bytes memory encoded = abi.encode(
      typeHash,
      keccak256(bytes(product.name)),
      product.price
    );
    return keccak256(encoded);
  }

  function orderTypeHash() internal pure returns (bytes32) {
    return keccak256(bytes(
      "Order(User buyer,User seller,uint8 orderType,Product product,uint256 quantity)"
      "Product(string name,uint256 price)"
      "User(uint256 id,string name,string email)"
    ));
  }

  function hashOrder(Order memory order) internal pure returns (bytes32) {
    bytes32 typeHash = orderTypeHash();
    bytes memory encoded = abi.encode(
      typeHash,
      hashUser(order.buyer),
      hashUser(order.seller),
      order.orderType,
      hashProduct(order.product),
      order.quantity
    );
    return keccak256(encoded);
  }
}