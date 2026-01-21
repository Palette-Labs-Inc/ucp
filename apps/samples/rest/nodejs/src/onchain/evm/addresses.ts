import { Address } from "ox";
import { contractAddresses } from "@ucp/contracts/generated/addresses";

export function getEscrowAddress(chainId: number): Address.Address {
  const addressBook = contractAddresses[chainId];
  if (!addressBook?.AuthCaptureEscrow) {
    throw new Error(`Missing AuthCaptureEscrow address for chain ${chainId}`);
  }
  return Address.from(addressBook.AuthCaptureEscrow);
}
