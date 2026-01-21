import type { Address, RpcSchema } from "ox";
import type {
  CollectorCollectTokensParams,
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
  MerchantPrepareCheckoutParams,
  PreApprovalIsPreApprovedParams,
  PreApprovalPreApproveParams,
  RpcCall,
  RpcCallResult,
} from "./types.js";

export type BackendRpcSchema = RpcSchema.From<
  | {
      Request: {
        method: "escrow_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "merchant_prepareCheckout";
        params: [MerchantPrepareCheckoutParams];
      };
      ReturnType: { calls: RpcCall[] };
    }
  | {
      Request: {
        method: "collector_erc3009_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "collector_erc3009_authCaptureEscrow";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_erc3009_collectTokens";
        params: [CollectorCollectTokensParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_erc3009_collectorType";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_erc3009_multicall3";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_permit2_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "collector_permit2_authCaptureEscrow";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_permit2_collectTokens";
        params: [CollectorCollectTokensParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_permit2_collectorType";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_permit2_multicall3";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_permit2_permit2";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_preApproval_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "collector_preApproval_authCaptureEscrow";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_preApproval_collectTokens";
        params: [CollectorCollectTokensParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_preApproval_collectorType";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_preApproval_isPreApproved";
        params: [PreApprovalIsPreApprovedParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_preApproval_preApprove";
        params: [PreApprovalPreApproveParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_spendPermission_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "collector_spendPermission_authCaptureEscrow";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_spendPermission_collectTokens";
        params: [CollectorCollectTokensParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_spendPermission_collectorType";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_spendPermission_spendPermissionManager";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_operatorRefund_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "collector_operatorRefund_authCaptureEscrow";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_operatorRefund_collectTokens";
        params: [CollectorCollectTokensParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "collector_operatorRefund_collectorType";
        params: [];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_getAddress";
        params: [];
      };
      ReturnType: { address: Address.Address };
    }
  | {
      Request: {
        method: "identity_agentExists";
        params: [IdentityAgentExistsParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_approve";
        params: [IdentityApproveParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_balanceOf";
        params: [IdentityBalanceOfParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_getAgentWallet";
        params: [IdentityGetAgentWalletParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_getApproved";
        params: [IdentityGetApprovedParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_getMetadata";
        params: [IdentityGetMetadataParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_isApprovedForAll";
        params: [IdentityIsApprovedForAllParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_name";
        params: [IdentityNameParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_ownerOf";
        params: [IdentityOwnerOfParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_register";
        params: [IdentityRegisterParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_safeTransferFrom";
        params: [IdentitySafeTransferFromParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_setAgentURI";
        params: [IdentitySetAgentUriParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_setAgentWallet";
        params: [IdentitySetAgentWalletParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_setApprovalForAll";
        params: [IdentitySetApprovalForAllParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_setMetadata";
        params: [IdentitySetMetadataParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_supportsInterface";
        params: [IdentitySupportsInterfaceParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_symbol";
        params: [IdentitySymbolParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_tokenURI";
        params: [IdentityTokenUriParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_totalAgents";
        params: [IdentityTotalAgentsParams];
      };
      ReturnType: RpcCallResult;
    }
  | {
      Request: {
        method: "identity_transferFrom";
        params: [IdentityTransferFromParams];
      };
      ReturnType: RpcCallResult;
    }
>;
