import type { Abi } from "abitype";
import type { Address, Hex } from "ox";
import type { ContractFunctionArgs, ContractFunctionName } from "viem";
import { encodeFunctionData } from "viem";

type AnyStateMutability = "view" | "pure" | "nonpayable" | "payable";
type AnyFunctionName = ContractFunctionName<Abi, AnyStateMutability>;
type AnyFunctionArgs = ContractFunctionArgs<Abi, AnyStateMutability, AnyFunctionName>;

export function buildContractCall(args: {
  address: Address.Address;
  abi: Abi;
  functionName: AnyFunctionName;
  args: AnyFunctionArgs;
}): { to: Address.Address; data: Hex.Hex } {
  return {
    to: args.address,
    data: encodeFunctionData({
      abi: args.abi,
      functionName: args.functionName,
      args: args.args,
    }),
  };
}
