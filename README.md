# EIP712 Hash and Signature
Sample project to show how to use EIP712 hash and signature in solidity and javascript using ethers v6 library

## Notes
- change `enum` to `uint8` in typehash
- for a nested struct typehash, append the child struct typehash after the parent
- change `string` value to `keccak256(bytes(value))`