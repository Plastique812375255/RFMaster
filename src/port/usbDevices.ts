/**
 * conference/rotorflight-configurator-release-2.2.1/src/js/port_handler.js
 * 首参必须是 { filters: [...] }，不能传裸数组，否则 chrome.usb.getDevices 报 No matching signature。
 */
export const usbDevices = {
  filters: [
    { vendorId: 1155, productId: 57105 },
    { vendorId: 10473, productId: 393 },
  ],
} as const;
