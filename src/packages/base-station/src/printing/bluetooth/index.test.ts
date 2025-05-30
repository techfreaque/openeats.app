import { beforeEach, describe, expect, it, vi } from "vitest";
import os from "os";
import { EventEmitter } from "events";
import util from "util";
import { exec } from "child_process";

// Create mock functions BEFORE they're used in vi.mock
const mockExecPromise = vi.fn();
const mockConfigBluetooth = { 
  enabled: true, 
  name: "TestPrinter",
  address: "00:11:22:33:44:55",
  channel: 1,
  discoverable: true,
  discoveryTimeout: 30000
};

// Create a mock for the child_process exec
const mockExec = vi.fn().mockImplementation(() => {
  return {
    stdout: "",
    stderr: "",
  };
});

// Mock external dependencies
vi.mock("child_process", () => ({
  exec: vi.fn((command, callback) => {
    if (callback) {
      const result = mockExec();
      callback(null, result);
    }
    return {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn(),
    };
  }),
}));

vi.mock("util", () => ({
  default: {
    promisify: vi.fn().mockImplementation((fn) => mockExecPromise),
  },
  promisify: vi.fn().mockImplementation((fn) => mockExecPromise),
}));

vi.mock("fs", () => ({
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(() => "test content"),
  unlinkSync: vi.fn(),
}));

vi.mock("os", () => ({
  tmpdir: vi.fn(() => "/tmp"),
  platform: vi.fn(() => "linux"), // Default to Linux for tests
}));

vi.mock("../../config", () => ({
  config: {
    printing: {
      tempDirectory: "/tmp/printing",
      receiptWidth: 40,
      bluetooth: mockConfigBluetooth,
    },
  },
}));

vi.mock("../../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  logError: vi.fn(),
}));

// Create mock responses for the Bluetooth discovery process
const mockSuccessStdout = `Scanning ...
	00:11:22:33:44:55	TestPrinter
	AA:BB:CC:DD:EE:FF	OtherDevice
Scan complete
`;

const mockNoDevicesStdout = `Scanning ...
Scan complete
`;

// Set up mock for successful execution
mockExecPromise.mockImplementation((command) => {
  if (command.includes("hcitool scan")) {
    return Promise.resolve({ stdout: mockSuccessStdout, stderr: "" });
  }
  return Promise.resolve({ stdout: "Success", stderr: "" });
});

// Import after mocks are set up
import {
  bluetoothPrinterService,
  createBluetoothPrinterService,
  BluetoothPrinterInfo,
} from "./index";

describe("Bluetooth Printer Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset platform to Linux by default
    vi.mocked(os.platform).mockImplementation(() => "linux");
  });

  describe("Factory Creation", () => {
    it("should create a Linux service on Linux platform", () => {
      vi.mocked(os.platform).mockReturnValue("linux");

      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      expect(service).toBeDefined();
      expect(service.isEnabled()).toBe(true);
    });

    it("should create a Windows service on Windows platform", () => {
      vi.mocked(os.platform).mockReturnValue("win32");

      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      expect(service).toBeDefined();
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe("Linux Bluetooth Printer Service", () => {
    beforeEach(() => {
      vi.mocked(os.platform).mockReturnValue("linux");
      
      // Mock exec to return success for Bluetooth checks
      mockExec.mockImplementation((command) => {
        if (command === "which bluetoothctl") {
          return { stdout: "/usr/bin/bluetoothctl", stderr: "" };
        }
        if (command === "systemctl is-active bluetooth") {
          return { stdout: "active", stderr: "" };
        }
        if (command.startsWith("bluetoothctl devices")) {
          return {
            stdout: "Device 00:11:22:33:44:55 Thermal Printer\nDevice 66:77:88:99:AA:BB Not a Printer",
            stderr: "",
          };
        }
        if (command.startsWith("bluetoothctl info")) {
          return {
            stdout: "SPP\nConnected: yes",
            stderr: "",
          };
        }
        return { stdout: "", stderr: "" };
      });
    });

    it("should check if Bluetooth is available", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const available = await service.isAvailable();
      expect(available).toBe(true);

      // Should have checked for bluetoothctl and service status
      expect(mockExec).toHaveBeenCalledWith("which bluetoothctl");
      expect(mockExec).toHaveBeenCalledWith("systemctl is-active bluetooth");
    });

    it("should handle Bluetooth not being available", async () => {
      // Mock bluetoothctl not found
      mockExec.mockImplementationOnce(() => {
        throw new Error("Command failed");
      });

      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const available = await service.isAvailable();
      expect(available).toBe(false);
    });

    it("should discover printers when discoverable is enabled", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 100, // Use shorter timeout for tests
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const printers = await service.discoverPrinters();
      
      expect(printers).toHaveLength(1);
      expect(printers[0].name).toBe("Thermal Printer");
      expect(printers[0].address).toBe("00:11:22:33:44:55");
      expect(printers[0].connected).toBe(true);

      // Verify discovery commands were called
      expect(mockExec).toHaveBeenCalledWith("bluetoothctl scan on");
      expect(mockExec).toHaveBeenCalledWith("bluetoothctl scan off");
      expect(mockExec).toHaveBeenCalledWith("bluetoothctl devices");
    });

    it("should return configured printer when discovery is disabled", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Configured Printer",
        address: "AA:BB:CC:DD:EE:FF",
        channel: 1,
        discoverable: false,
        discoveryTimeout: 1000,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const printers = await service.discoverPrinters();
      
      expect(printers).toHaveLength(1);
      expect(printers[0].name).toBe("Configured Printer");
      expect(printers[0].address).toBe("AA:BB:CC:DD:EE:FF");
      expect(printers[0].connected).toBe(false);

      // Should not call discovery commands
      expect(mockExec).not.toHaveBeenCalledWith("bluetoothctl scan on");
    });

    it("should print to Bluetooth printer", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "00:11:22:33:44:55",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Test printing
      const result = await service.print("test content", "test.txt");
      
      expect(result.success).toBe(true);
      
      // Verify that the printing commands were called
      expect(mockExec).toHaveBeenCalledWith("bluetoothctl connect 00:11:22:33:44:55");
      expect(mockExec).toHaveBeenCalledWith(expect.stringContaining("obexftp"));
      expect(vi.mocked(require("fs").writeFileSync)).toHaveBeenCalled();
      expect(vi.mocked(require("fs").unlinkSync)).toHaveBeenCalled();
    });

    it("should handle printing errors", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "00:11:22:33:44:55",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Mock printing failure
      mockExec.mockImplementationOnce(() => {
        throw new Error("Print failed");
      });

      // Test printing with error
      const result = await service.print("test content", "test.txt");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Print failed");
      
      // Error should be logged
      expect(vi.mocked(require("../../logging").logError)).toHaveBeenCalled();
    });
  });

  describe("Windows Bluetooth Printer Service", () => {
    beforeEach(() => {
      vi.mocked(os.platform).mockReturnValue("win32");
      
      // Mock PowerShell commands for Windows tests
      mockExec.mockImplementation((command) => {
        if (command.includes("Get-PnpDevice -Class Bluetooth")) {
          return { stdout: "Status\n-----\nOK", stderr: "" };
        }
        if (command.includes("ConvertTo-Json")) {
          return {
            stdout: JSON.stringify([
              {
                FriendlyName: "Thermal Printer",
                DeviceID: "BTHENUM\\{00001101-0000-1000-8000-00805F9B34FB}_VID&00022222_PID&3333\\7&ABC1234&0&000000000000_C00000000000",
              },
              {
                FriendlyName: "Not a printer device",
                DeviceID: "USB\\VID_1234&PID_5678\\ABCDEF",
              },
            ]),
            stderr: "",
          };
        }
        if (command.includes("Get-PnpDevice -InstanceId")) {
          return { stdout: "Thermal Printer", stderr: "" };
        }
        return { stdout: "", stderr: "" };
      });
    });

    it("should check if Bluetooth is available on Windows", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const available = await service.isAvailable();
      expect(available).toBe(true);

      // Should have checked Bluetooth status using PowerShell
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining("Get-PnpDevice -Class Bluetooth")
      );
    });

    it("should discover printers on Windows", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 100,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      const printers = await service.discoverPrinters();
      
      expect(printers).toHaveLength(1);
      expect(printers[0].name).toBe("Thermal Printer");
      expect(printers[0].connected).toBe(true);
    });

    it("should print to Windows Bluetooth printer", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "BTHENUM\\{00001101-0000-1000-8000-00805F9B34FB}_VID&00022222_PID&3333\\7&ABC1234&0&000000000000_C00000000000",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });

      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Test printing
      const result = await service.print("test content", "test.txt");
      
      expect(result.success).toBe(true);
      
      // Should use PowerShell for Windows printing
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining("Get-PnpDevice -InstanceId")
      );
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining("Start-Process")
      );
      expect(vi.mocked(require("fs").writeFileSync)).toHaveBeenCalled();
    });

    it("should handle format receipt text", async () => {
      vi.mocked(require("fs").readFileSync).mockReturnValueOnce(
        "This is a very long line that should be wrapped to fit within the configured receipt width. It contains more than 40 characters."
      );
      
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "00:11:22:33:44:55",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });
      
      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Test printing with text that needs formatting
      await service.print("test content", "receipt.txt");
      
      // Should have called writeFileSync twice - once for original content and once for formatted
      expect(vi.mocked(require("fs").writeFileSync)).toHaveBeenCalledTimes(2);
    });
  });

  describe("Common tests for both platforms", () => {
    it("should return false when Bluetooth is disabled in config", async () => {
      const service = createBluetoothPrinterService({
        enabled: false,
        name: "Test",
        address: "00:11:22:33:44:55",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });
      
      expect(service.isEnabled()).toBe(false);
      
      // Print should fail when disabled
      const result = await service.print("test content", "test.txt");
      expect(result.success).toBe(false);
      expect(result.error).toContain("disabled");
    });

    it("should fail when no printer address is specified", async () => {
      const service = createBluetoothPrinterService({
        enabled: true,
        name: "Test",
        address: "", // Empty address
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      });
      
      // Give time for the constructor's async checkAvailability to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Print should fail with no address
      const result = await service.print("test content", "test.txt", { printer: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("No Bluetooth printer address specified");
    });
  });

  describe("isAvailable", () => {
    it("should check if bluetooth is available", async () => {
      // Call the method
      const result = await bluetoothPrinterService.isAvailable();
      
      // Since we've mocked the exec call to succeed, it should be available
      expect(result).toBe(true);
      expect(mockExecPromise).toHaveBeenCalledWith(expect.stringContaining("rfcomm"));
    });

    it("should handle errors when checking availability", async () => {
      // Make the exec call fail
      mockExecPromise.mockRejectedValueOnce(new Error("Command failed"));
      
      // Call the method
      const result = await bluetoothPrinterService.isAvailable();
      
      // Should return false when command fails
      expect(result).toBe(false);
    });
  });

  describe("discoverPrinters", () => {
    it("should discover bluetooth printers", async () => {
      // Call the method
      const result = await bluetoothPrinterService.discoverPrinters();
      
      // Should return parsed devices from stdout
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "TestPrinter",
        address: "00:11:22:33:44:55",
      });
      expect(mockExecPromise).toHaveBeenCalledWith(expect.stringContaining("hcitool scan"));
    });
    
    it("should handle no devices found", async () => {
      // Make the scan return no devices
      mockExecPromise.mockResolvedValueOnce({ stdout: mockNoDevicesStdout, stderr: "" });
      
      // Call the method
      const result = await bluetoothPrinterService.discoverPrinters();
      
      // Should return empty array
      expect(result).toEqual([]);
    });
    
    it("should handle errors during discovery", async () => {
      // Make the exec call fail
      mockExecPromise.mockRejectedValueOnce(new Error("Command failed"));
      
      // Call the method
      const result = await bluetoothPrinterService.discoverPrinters();
      
      // Should return empty array on error
      expect(result).toEqual([]);
    });
  });

  describe("connectPrinter", () => {
    it("should connect to a bluetooth printer", async () => {
      // Call the method
      const result = await bluetoothPrinterService.connectPrinter("00:11:22:33:44:55", "TestPrinter");
      
      // Should succeed
      expect(result).toBe(true);
      expect(mockExecPromise).toHaveBeenCalledWith(expect.stringContaining("rfcomm bind"));
    });
    
    it("should handle connection errors", async () => {
      // Make the exec call fail
      mockExecPromise.mockRejectedValueOnce(new Error("Connection failed"));
      
      // Call the method
      const result = await bluetoothPrinterService.connectPrinter("00:11:22:33:44:55", "TestPrinter");
      
      // Should return false on error
      expect(result).toBe(false);
    });
  });

  describe("disconnectPrinter", () => {
    it("should disconnect from a bluetooth printer", async () => {
      // Call the method
      const result = await bluetoothPrinterService.disconnectPrinter("00:11:22:33:44:55");
      
      // Should succeed
      expect(result).toBe(true);
      expect(mockExecPromise).toHaveBeenCalledWith(expect.stringContaining("rfcomm release"));
    });
    
    it("should handle disconnection errors", async () => {
      // Make the exec call fail
      mockExecPromise.mockRejectedValueOnce(new Error("Disconnection failed"));
      
      // Call the method
      const result = await bluetoothPrinterService.disconnectPrinter("00:11:22:33:44:55");
      
      // Should return false on error
      expect(result).toBe(false);
    });
  });

  describe("printFile", () => {
    it("should print a file to bluetooth printer", async () => {
      // Call the method
      const result = await bluetoothPrinterService.printFile("/path/to/file.txt");
      
      // Should succeed
      expect(result).toBe(true);
      expect(mockExecPromise).toHaveBeenCalledWith(expect.stringContaining("cat"));
    });
    
    it("should handle printing errors", async () => {
      // Make the exec call fail
      mockExecPromise.mockRejectedValueOnce(new Error("Printing failed"));
      
      // Call the method
      const result = await bluetoothPrinterService.printFile("/path/to/file.txt");
      
      // Should return false on error
      expect(result).toBe(false);
    });
  });

  describe("getPrinterStatus", () => {
    it("should get printer status", async () => {
      // Call the method
      const result = await bluetoothPrinterService.getPrinterStatus("00:11:22:33:44:55");
      
      // Should succeed with default connected status since we mocked success
      expect(result).toEqual({ connected: true, status: "Ready" });
    });
    
    it("should handle status check errors", async () => {
      // Make the exec call fail
      mockExecPromise.mockRejectedValueOnce(new Error("Status check failed"));
      
      // Call the method
      const result = await bluetoothPrinterService.getPrinterStatus("00:11:22:33:44:55");
      
      // Should return disconnected status on error
      expect(result).toEqual({ connected: false, status: "Disconnected" });
    });
  });

  describe("Configuration", () => {
    it("should update bluetooth settings", async () => {
      // Call the method
      const newSettings = {
        enabled: true,
        name: "NewPrinterName",
        address: "AA:BB:CC:DD:EE:FF"
      };
      
      bluetoothPrinterService.updateSettings(newSettings);
      
      // Should update the internal config
      expect(mockConfigBluetooth.name).toBe("NewPrinterName");
      expect(mockConfigBluetooth.address).toBe("AA:BB:CC:DD:EE:FF");
    });
  });
});