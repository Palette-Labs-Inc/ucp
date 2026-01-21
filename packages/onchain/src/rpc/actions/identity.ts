import { Address } from "ox";
import { contractAddresses, identity_registry_abi } from "#/contracts";

import type { RpcActions } from "../router.js";
import type {
  IdentityAgentExistsParams,
  IdentityApproveParams,
  IdentityBalanceOfParams,
  IdentityGetAgentWalletParams,
  IdentityGetApprovedParams,
  IdentityGetMetadataParams,
  IdentityIsApprovedForAllParams,
  IdentityNameParams,
  IdentityOwnerOfParams,
  IdentityRegisterParams,
  IdentitySafeTransferFromParams,
  IdentitySetAgentUriParams,
  IdentitySetAgentWalletParams,
  IdentitySetApprovalForAllParams,
  IdentitySetMetadataParams,
  IdentitySupportsInterfaceParams,
  IdentitySymbolParams,
  IdentityTokenUriParams,
  IdentityTotalAgentsParams,
  IdentityTransferFromParams,
} from "../types.js";
import { buildContractCall } from "../../evm/contracts/call-builder.js";

export function createIdentityActions(args: {
  chainId: number;
}): Pick<
  RpcActions,
  | "identity_getAddress"
  | "identity_agentExists"
  | "identity_approve"
  | "identity_balanceOf"
  | "identity_getAgentWallet"
  | "identity_getApproved"
  | "identity_getMetadata"
  | "identity_isApprovedForAll"
  | "identity_name"
  | "identity_ownerOf"
  | "identity_register"
  | "identity_safeTransferFrom"
  | "identity_setAgentURI"
  | "identity_setAgentWallet"
  | "identity_setApprovalForAll"
  | "identity_setMetadata"
  | "identity_supportsInterface"
  | "identity_symbol"
  | "identity_tokenURI"
  | "identity_totalAgents"
  | "identity_transferFrom"
> {
  const identityAddress = Address.from(
    contractAddresses[args.chainId].IdentityRegistry
  );

  return {
    async identity_getAddress(_params: []) {
      return { address: identityAddress };
    },
    async identity_agentExists([params]: [IdentityAgentExistsParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "agentExists",
          args: params.args,
        }),
      };
    },
    async identity_approve([params]: [IdentityApproveParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "approve",
          args: params.args,
        }),
      };
    },
    async identity_balanceOf([params]: [IdentityBalanceOfParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "balanceOf",
          args: params.args,
        }),
      };
    },
    async identity_getAgentWallet([params]: [IdentityGetAgentWalletParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "getAgentWallet",
          args: params.args,
        }),
      };
    },
    async identity_getApproved([params]: [IdentityGetApprovedParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "getApproved",
          args: params.args,
        }),
      };
    },
    async identity_getMetadata([params]: [IdentityGetMetadataParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "getMetadata",
          args: params.args,
        }),
      };
    },
    async identity_isApprovedForAll([params]: [IdentityIsApprovedForAllParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "isApprovedForAll",
          args: params.args,
        }),
      };
    },
    async identity_name([params]: [IdentityNameParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "name",
          args: params.args,
        }),
      };
    },
    async identity_ownerOf([params]: [IdentityOwnerOfParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "ownerOf",
          args: params.args,
        }),
      };
    },
    async identity_register([params]: [IdentityRegisterParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "register",
          args: params.args,
        }),
      };
    },
    async identity_safeTransferFrom([params]: [IdentitySafeTransferFromParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "safeTransferFrom",
          args: params.args,
        }),
      };
    },
    async identity_setAgentURI([params]: [IdentitySetAgentUriParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "setAgentURI",
          args: params.args,
        }),
      };
    },
    async identity_setAgentWallet([params]: [IdentitySetAgentWalletParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "setAgentWallet",
          args: params.args,
        }),
      };
    },
    async identity_setApprovalForAll(
      [params]: [IdentitySetApprovalForAllParams]
    ) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "setApprovalForAll",
          args: params.args,
        }),
      };
    },
    async identity_setMetadata([params]: [IdentitySetMetadataParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "setMetadata",
          args: params.args,
        }),
      };
    },
    async identity_supportsInterface([params]: [IdentitySupportsInterfaceParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "supportsInterface",
          args: params.args,
        }),
      };
    },
    async identity_symbol([params]: [IdentitySymbolParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "symbol",
          args: params.args,
        }),
      };
    },
    async identity_tokenURI([params]: [IdentityTokenUriParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "tokenURI",
          args: params.args,
        }),
      };
    },
    async identity_totalAgents([params]: [IdentityTotalAgentsParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "totalAgents",
          args: params.args,
        }),
      };
    },
    async identity_transferFrom([params]: [IdentityTransferFromParams]) {
      return {
        call: buildContractCall({
          address: identityAddress,
          abi: identity_registry_abi,
          functionName: "transferFrom",
          args: params.args,
        }),
      };
    },
  };
}
