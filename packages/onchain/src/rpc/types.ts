import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import type { Address, Hex } from "ox";
import type { ContractFunctionArgs } from "viem";
import {
  auth_capture_escrow_abi,
  identity_registry_abi,
  pre_approval_payment_collector_abi,
  token_collector_abi,
} from "../contracts/contracts.js";

type AuthorizeFn = ExtractAbiFunction<
  typeof auth_capture_escrow_abi,
  "authorize"
>;
type AuthorizeArgs = AbiParametersToPrimitiveTypes<AuthorizeFn["inputs"]>;

export type PaymentInfo = AuthorizeArgs[0];

export type RpcCall = {
  to: Address.Address;
  data: Hex.Hex;
  value?: Hex.Hex;
};

export interface RpcCallResult {
  call: RpcCall;
}

export interface MerchantPrepareCheckoutParams {
  paymentInfo: PaymentInfo;
  amount: AuthorizeArgs[1];
  tokenCollector: AuthorizeArgs[2];
  collectorData: AuthorizeArgs[3];
}

type CollectTokensFn = ExtractAbiFunction<
  typeof token_collector_abi,
  "collectTokens"
>;
type CollectTokensArgs = AbiParametersToPrimitiveTypes<CollectTokensFn["inputs"]>;

export interface CollectorCollectTokensParams {
  paymentInfo: CollectTokensArgs[0];
  tokenStore: CollectTokensArgs[1];
  amount: CollectTokensArgs[2];
  collectorData: CollectTokensArgs[3];
}

type PreApproveFn = ExtractAbiFunction<
  typeof pre_approval_payment_collector_abi,
  "preApprove"
>;
type PreApproveArgs = AbiParametersToPrimitiveTypes<PreApproveFn["inputs"]>;

export interface PreApprovalPreApproveParams {
  paymentInfo: PreApproveArgs[0];
}

type IsPreApprovedFn = ExtractAbiFunction<
  typeof pre_approval_payment_collector_abi,
  "isPreApproved"
>;
type IsPreApprovedArgs = AbiParametersToPrimitiveTypes<IsPreApprovedFn["inputs"]>;

export interface PreApprovalIsPreApprovedParams {
  paymentInfoHash: IsPreApprovedArgs[0];
}

export interface IdentityAgentExistsParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "agentExists">;
}

export interface IdentityApproveParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "nonpayable", "approve">;
}

export interface IdentityBalanceOfParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "balanceOf">;
}

export interface IdentityGetAgentWalletParams {
  args: ContractFunctionArgs<
    typeof identity_registry_abi,
    "view",
    "getAgentWallet"
  >;
}

export interface IdentityGetApprovedParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "getApproved">;
}

export interface IdentityGetMetadataParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "getMetadata">;
}

export interface IdentityIsApprovedForAllParams {
  args: ContractFunctionArgs<
    typeof identity_registry_abi,
    "view",
    "isApprovedForAll"
  >;
}

export interface IdentityNameParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "name">;
}

export interface IdentityOwnerOfParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "ownerOf">;
}

export interface IdentityRegisterParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "nonpayable", "register">;
}

export interface IdentitySafeTransferFromParams {
  args: ContractFunctionArgs<
    typeof identity_registry_abi,
    "nonpayable",
    "safeTransferFrom"
  >;
}

export interface IdentitySetAgentUriParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "nonpayable", "setAgentURI">;
}

export interface IdentitySetAgentWalletParams {
  args: ContractFunctionArgs<
    typeof identity_registry_abi,
    "nonpayable",
    "setAgentWallet"
  >;
}

export interface IdentitySetApprovalForAllParams {
  args: ContractFunctionArgs<
    typeof identity_registry_abi,
    "nonpayable",
    "setApprovalForAll"
  >;
}

export interface IdentitySetMetadataParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "nonpayable", "setMetadata">;
}

export interface IdentitySupportsInterfaceParams {
  args: ContractFunctionArgs<
    typeof identity_registry_abi,
    "view",
    "supportsInterface"
  >;
}

export interface IdentitySymbolParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "symbol">;
}

export interface IdentityTokenUriParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "tokenURI">;
}

export interface IdentityTotalAgentsParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "view", "totalAgents">;
}

export interface IdentityTransferFromParams {
  args: ContractFunctionArgs<typeof identity_registry_abi, "nonpayable", "transferFrom">;
}
