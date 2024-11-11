# EIP712 Hash and Signature
Sample project to show how to use EIP712 hash and signature in solidity and javascript using ethers v6 library

## Notes
- change `enum` to `uint8` in typehash
- change `string` value to `keccak256(bytes(value))`

## Type Serialization
[EIP712](https://eips.ethereum.org/EIPS/eip-712) have defined how to serialize type

### Simple Struct

```solidity
struct Product {
  string name;
  uint256 price;
}
```
for this struct, the type serialization should be `Product(string name,uint256 price)`

### Nested Struct
```solidity
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
```
for this struct, the struct is nested
- the main struct placed in the front
- child struct placed after, ordered by alphabet
- convert any `enum` type to `uint8`

the type serialization should be
`Order(User buyer,User seller,uint8 orderType,Product product,uint256 quantity)Product(string name,uint256 price)User(uint256 id,string name, string email)`

## Manual Encoding
To encode a struct, we need type, typehash and the value

```solidity
struct Product {
  string name;
  uint256 price;
}
```

```javascript
const product = {
  name: "Some Product",
  price: 100
}
```

the type serialization would be `Product(string name,uint256 price)`

the typehash would be `keccak256(Buffer.from(Product(string name,uint256 price)))`

the encoding process would be
```javascript
abiCoder.encode(
  ['bytes32', 'bytes32', 'uint256'],
  [`keccak256(Buffer.from(Product(string name,uint256 price)))`, `keccak256(Buffer.from('Some Product')))`, 100]
)
```

## Automatic Encoding using TypeEncoder Ethers V6
We could encode struct using TypeEncoder because encoding manually is error prone. Only need type and value

Define encoder
```javascript
const types = {
  Product: [
    { name: 'name', type: 'string' },
    { name: 'price', type: 'uint256' }
  ]
}
const typeEncoder = ethers.TypedDataEncoder(types)
```

Encode type
```javascript
typeEncoder.encodeType('Product')
```

Encode data
```javascript
typeEncoder.encodeData('Product', {
  name: "Some Product",
  price: 100
})
```
this will produce encoded data of the struct