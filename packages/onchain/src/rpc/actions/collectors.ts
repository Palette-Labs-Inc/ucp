import { Address } from "ox";
import { contractAddresses } from "#/contracts";
import {
  erc3009_payment_collector_abi,
  operator_refund_collector_abi,
  permit2_payment_collector_abi,
  pre_approval_payment_collector_abi,
  spend_permission_payment_collector_abi,
} from "#/contracts";

import type { RpcActions } from "../router.js";
import type {
  CollectorCollectTokensParams,
  PreApprovalIsPreApprovedParams,
  PreApprovalPreApproveParams,
} from "../types.js";
import { buildContractCall } from "../../evm/contracts/call-builder.js";

export function createCollectorActions(args: {
  chainId: number;
}): Pick<
  RpcActions,
  | "collector_erc3009_getAddress"
  | "collector_erc3009_authCaptureEscrow"
  | "collector_erc3009_collectTokens"
  | "collector_erc3009_collectorType"
  | "collector_erc3009_multicall3"
  | "collector_permit2_getAddress"
  | "collector_permit2_authCaptureEscrow"
  | "collector_permit2_collectTokens"
  | "collector_permit2_collectorType"
  | "collector_permit2_multicall3"
  | "collector_permit2_permit2"
  | "collector_preApproval_getAddress"
  | "collector_preApproval_authCaptureEscrow"
  | "collector_preApproval_collectTokens"
  | "collector_preApproval_collectorType"
  | "collector_preApproval_isPreApproved"
  | "collector_preApproval_preApprove"
  | "collector_spendPermission_getAddress"
  | "collector_spendPermission_authCaptureEscrow"
  | "collector_spendPermission_collectTokens"
  | "collector_spendPermission_collectorType"
  | "collector_spendPermission_spendPermissionManager"
  | "collector_operatorRefund_getAddress"
  | "collector_operatorRefund_authCaptureEscrow"
  | "collector_operatorRefund_collectTokens"
  | "collector_operatorRefund_collectorType"
> {
  const addressBook = contractAddresses[args.chainId];
  const erc3009Address = Address.from(addressBook.ERC3009PaymentCollector);
  const permit2Address = Address.from(addressBook.Permit2PaymentCollector);
  const preApprovalAddress = Address.from(addressBook.PreApprovalPaymentCollector);
  const spendPermissionAddress = Address.from(
    addressBook.SpendPermissionPaymentCollector
  );
  const operatorRefundAddress = Address.from(addressBook.OperatorRefundCollector);

  return {
    async collector_erc3009_getAddress(_params: []) {
      return { address: erc3009Address };
    },
    async collector_erc3009_authCaptureEscrow(_params: []) {
      return {
        call: buildContractCall({
          address: erc3009Address,
          abi: erc3009_payment_collector_abi,
          functionName: "authCaptureEscrow",
          args: [],
        }),
      };
    },
    async collector_erc3009_collectTokens(
      [params]: [CollectorCollectTokensParams]
    ) {
      return {
        call: buildContractCall({
          address: erc3009Address,
          abi: erc3009_payment_collector_abi,
          functionName: "collectTokens",
          args: [
            params.paymentInfo,
            params.tokenStore,
            params.amount,
            params.collectorData,
          ],
        }),
      };
    },
    async collector_erc3009_collectorType(_params: []) {
      return {
        call: buildContractCall({
          address: erc3009Address,
          abi: erc3009_payment_collector_abi,
          functionName: "collectorType",
          args: [],
        }),
      };
    },
    async collector_erc3009_multicall3(_params: []) {
      return {
        call: buildContractCall({
          address: erc3009Address,
          abi: erc3009_payment_collector_abi,
          functionName: "multicall3",
          args: [],
        }),
      };
    },
    async collector_permit2_getAddress(_params: []) {
      return { address: permit2Address };
    },
    async collector_permit2_authCaptureEscrow(_params: []) {
      return {
        call: buildContractCall({
          address: permit2Address,
          abi: permit2_payment_collector_abi,
          functionName: "authCaptureEscrow",
          args: [],
        }),
      };
    },
    async collector_permit2_collectTokens(
      [params]: [CollectorCollectTokensParams]
    ) {
      return {
        call: buildContractCall({
          address: permit2Address,
          abi: permit2_payment_collector_abi,
          functionName: "collectTokens",
          args: [
            params.paymentInfo,
            params.tokenStore,
            params.amount,
            params.collectorData,
          ],
        }),
      };
    },
    async collector_permit2_collectorType(_params: []) {
      return {
        call: buildContractCall({
          address: permit2Address,
          abi: permit2_payment_collector_abi,
          functionName: "collectorType",
          args: [],
        }),
      };
    },
    async collector_permit2_multicall3(_params: []) {
      return {
        call: buildContractCall({
          address: permit2Address,
          abi: permit2_payment_collector_abi,
          functionName: "multicall3",
          args: [],
        }),
      };
    },
    async collector_permit2_permit2(_params: []) {
      return {
        call: buildContractCall({
          address: permit2Address,
          abi: permit2_payment_collector_abi,
          functionName: "permit2",
          args: [],
        }),
      };
    },
    async collector_preApproval_getAddress(_params: []) {
      return { address: preApprovalAddress };
    },
    async collector_preApproval_authCaptureEscrow(_params: []) {
      return {
        call: buildContractCall({
          address: preApprovalAddress,
          abi: pre_approval_payment_collector_abi,
          functionName: "authCaptureEscrow",
          args: [],
        }),
      };
    },
    async collector_preApproval_collectTokens(
      [params]: [CollectorCollectTokensParams]
    ) {
      return {
        call: buildContractCall({
          address: preApprovalAddress,
          abi: pre_approval_payment_collector_abi,
          functionName: "collectTokens",
          args: [
            params.paymentInfo,
            params.tokenStore,
            params.amount,
            params.collectorData,
          ],
        }),
      };
    },
    async collector_preApproval_collectorType(_params: []) {
      return {
        call: buildContractCall({
          address: preApprovalAddress,
          abi: pre_approval_payment_collector_abi,
          functionName: "collectorType",
          args: [],
        }),
      };
    },
    async collector_preApproval_isPreApproved(
      [params]: [PreApprovalIsPreApprovedParams]
    ) {
      return {
        call: buildContractCall({
          address: preApprovalAddress,
          abi: pre_approval_payment_collector_abi,
          functionName: "isPreApproved",
          args: [params.paymentInfoHash],
        }),
      };
    },
    async collector_preApproval_preApprove(
      [params]: [PreApprovalPreApproveParams]
    ) {
      return {
        call: buildContractCall({
          address: preApprovalAddress,
          abi: pre_approval_payment_collector_abi,
          functionName: "preApprove",
          args: [params.paymentInfo],
        }),
      };
    },
    async collector_spendPermission_getAddress(_params: []) {
      return { address: spendPermissionAddress };
    },
    async collector_spendPermission_authCaptureEscrow(_params: []) {
      return {
        call: buildContractCall({
          address: spendPermissionAddress,
          abi: spend_permission_payment_collector_abi,
          functionName: "authCaptureEscrow",
          args: [],
        }),
      };
    },
    async collector_spendPermission_collectTokens(
      [params]: [CollectorCollectTokensParams]
    ) {
      return {
        call: buildContractCall({
          address: spendPermissionAddress,
          abi: spend_permission_payment_collector_abi,
          functionName: "collectTokens",
          args: [
            params.paymentInfo,
            params.tokenStore,
            params.amount,
            params.collectorData,
          ],
        }),
      };
    },
    async collector_spendPermission_collectorType(_params: []) {
      return {
        call: buildContractCall({
          address: spendPermissionAddress,
          abi: spend_permission_payment_collector_abi,
          functionName: "collectorType",
          args: [],
        }),
      };
    },
    async collector_spendPermission_spendPermissionManager(_params: []) {
      return {
        call: buildContractCall({
          address: spendPermissionAddress,
          abi: spend_permission_payment_collector_abi,
          functionName: "spendPermissionManager",
          args: [],
        }),
      };
    },
    async collector_operatorRefund_getAddress(_params: []) {
      return { address: operatorRefundAddress };
    },
    async collector_operatorRefund_authCaptureEscrow(_params: []) {
      return {
        call: buildContractCall({
          address: operatorRefundAddress,
          abi: operator_refund_collector_abi,
          functionName: "authCaptureEscrow",
          args: [],
        }),
      };
    },
    async collector_operatorRefund_collectTokens(
      [params]: [CollectorCollectTokensParams]
    ) {
      return {
        call: buildContractCall({
          address: operatorRefundAddress,
          abi: operator_refund_collector_abi,
          functionName: "collectTokens",
          args: [
            params.paymentInfo,
            params.tokenStore,
            params.amount,
            params.collectorData,
          ],
        }),
      };
    },
    async collector_operatorRefund_collectorType(_params: []) {
      return {
        call: buildContractCall({
          address: operatorRefundAddress,
          abi: operator_refund_collector_abi,
          functionName: "collectorType",
          args: [],
        }),
      };
    },
  };
}
