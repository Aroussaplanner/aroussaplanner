import { useVendor } from '../context/VendorContext'

export function useVendorAuth() {
  return useVendor()
}
