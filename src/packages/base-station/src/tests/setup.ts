// Set up test environment
import { vi } from "vitest";

// eslint-disable-next-line node/no-process-env
process.env.NODE_ENV = "test";

// Mock the config module properly to avoid actual file loading
vi.mock("../config", () => {
  // Create a mock configuration
  const mockConfig = {
    server: { port: 3001, host: "localhost" },
    security: {
      apiKey: "test-api-key",
      defaultApiKey: "test-default-api-key",
    },
    printing: {
      defaultPrinter: "Test Printer",
      tempDirectory: "./temp",
      receiptWidth: 40,
      autoRetry: true,
      maxRetries: 3,
      retryDelay: 100,
      bluetooth: {
        enabled: true,
        name: "Test Bluetooth Printer",
        address: "00:11:22:33:44:55",
        channel: 1,
        discoverable: true,
        discoveryTimeout: 1000,
      },
    },
    websocket: {
      url: "ws://localhost:3001",
      reconnectInterval: 100,
      maxReconnectAttempts: 3,
    },
    notifications: {
      enabled: true,
      volume: 50,
      sounds: {
        newOrder: "./sounds/new-order.mp3",
        printSuccess: "./sounds/print-success.mp3",
        printError: "./sounds/print-error.mp3",
      },
    },
    gpio: {
      enabled: false,
      resetPin: 17,
    },
    logging: {
      level: "info",
      file: "logs/test.log",
      maxSize: 1000000,
      maxFiles: 3,
    },
  };

  return {
    config: mockConfig,
    loadConfig: vi.fn().mockReturnValue(mockConfig),
    updateConfig: vi.fn().mockReturnValue(mockConfig),
    getApiKey: vi.fn().mockReturnValue("test-api-key"),
    updateApiKey: vi.fn(),
    resetApiKey: vi.fn(),
    saveConfig: vi.fn(),
  };
});

// Mock the database to use an in-memory SQLite database
vi.mock("../db", () => {
  const sqlite3 = require("sqlite3");
  const { open } = require("sqlite");

  const initializeDatabase = async () => {
    const db = await open({
      filename: ":memory:",
      driver: sqlite3.Database,
    });

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON");

    // Create tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS print_jobs (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        file_name TEXT NOT NULL,
        printer TEXT,
        priority INTEGER DEFAULT 1,
        retries INTEGER DEFAULT 0,
        error TEXT,
        options TEXT,
        content BLOB
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS printer_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        default_options TEXT
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS category_printers (
        category_id TEXT NOT NULL,
        printer_name TEXT NOT NULL,
        PRIMARY KEY (category_id, printer_name),
        FOREIGN KEY (category_id) REFERENCES printer_categories(id) ON DELETE CASCADE
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS routing_rules (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        field TEXT NOT NULL,
        pattern TEXT NOT NULL,
        match_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES printer_categories(id) ON DELETE CASCADE
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS printer_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        balancing_strategy TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS group_printers (
        group_id TEXT NOT NULL,
        printer_name TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        PRIMARY KEY (group_id, printer_name),
        FOREIGN KEY (group_id) REFERENCES printer_groups(id) ON DELETE CASCADE
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS print_analytics (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        printer TEXT,
        category TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        duration INTEGER,
        page_count INTEGER,
        error TEXT
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS key_value (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    return db;
  };

  return {
    initializeDatabase,
    db: initializeDatabase(),
  };
});

// Mock the logger to avoid console output during tests
vi.mock("../logging", () => {
  return {
    __esModule: true,
    default: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    },
    logError: vi.fn(),
    logApiRequest: vi.fn(),
    logPrintJob: vi.fn(),
  };
});

// Mock the printer service
vi.mock("../printing", () => {
  return {
    printerService: {
      print: vi.fn().mockResolvedValue({ success: true }),
      getPrinters: vi.fn().mockResolvedValue([
        { name: "Test Printer", isDefault: true, status: "idle" },
        { name: "Another Printer", isDefault: false, status: "idle" },
      ]),
    },
    getPrinterStatus: vi.fn().mockResolvedValue([
      { name: "Test Printer", isDefault: true, status: "idle" },
      { name: "Another Printer", isDefault: false, status: "idle" },
    ]),
    getPrinters: vi.fn().mockResolvedValue([
      { name: "Test Printer", isDefault: true, status: "idle" },
      { name: "Another Printer", isDefault: false, status: "idle" },
    ]),
    printFile: vi.fn().mockResolvedValue({ success: true }),
  };
});

// Mock the WebSocket client
vi.mock("../websocket/client", () => {
  return {
    wsClient: {
      connect: vi.fn(),
      send: vi.fn(),
      on: vi.fn(),
      emit: vi.fn(),
    },
  };
});

// Mock the notifications service
vi.mock("../notifications", () => {
  return {
    playSound: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock the fs module properly to work with both ESM and CommonJS imports
vi.mock("fs", () => {
  const mockMethods = {
    existsSync: vi.fn().mockImplementation((path) => {
      // Ensure config paths always return true
      if (String(path).includes("config")) {
        return true;
      }
      // For temp directories that need creation, return false
      if (String(path).includes("temp")) {
        return false;
      }
      return true;
    }),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockImplementation((path) => {
      // Return valid JSON for config files
      if (String(path).includes("config") && String(path).includes(".json")) {
        return JSON.stringify({
          server: { port: 3000, host: "localhost" },
          websocket: {
            url: "ws://localhost:8080",
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
          },
          security: { apiKey: "test", defaultApiKey: "test" },
          printing: { defaultPrinter: "", tempDirectory: "/tmp" },
          notifications: { enabled: true, sounds: {} },
          gpio: { enabled: false },
          logging: {
            level: "info",
            file: "logs/test.log",
            maxSize: 1000000,
            maxFiles: 3,
          },
        });
      }
      // Return normal content for other files
      return "test content";
    }),
    unlinkSync: vi.fn(),
    statSync: vi.fn().mockReturnValue({
      mtimeMs: Date.now(),
    }),
    readdirSync: vi.fn().mockReturnValue(["test.png"]),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    unlink: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    createReadStream: vi.fn(),
    createWriteStream: vi.fn(),
    promises: {
      readFile: vi.fn().mockResolvedValue(Buffer.from("test")),
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      unlink: vi.fn().mockResolvedValue(undefined),
      readdir: vi.fn().mockResolvedValue(["test.png"]),
      stat: vi.fn().mockResolvedValue({ mtimeMs: Date.now() }),
    },
  };

  // Create a proper fs mock that handles both default and named exports
  const fs = Object.assign({}, mockMethods);
  fs.default = fs;

  return fs;
});

// Mock the util module properly to work with both ESM and CommonJS imports
vi.mock("util", () => {
  const mockPromisify = vi.fn().mockImplementation((fn) => {
    return vi.fn().mockResolvedValue({ stdout: "test", stderr: "" });
  });

  // Create a proper util mock that handles both default and named exports
  const util = {
    promisify: mockPromisify,
    inherits: vi.fn(),
    inspect: vi.fn(),
    format: vi.fn().mockImplementation((str) => str),
    types: {
      isPromise: vi.fn(),
      isDate: vi.fn(),
    },
  };

  // Support default export for ESM imports
  util.default = util;

  return util;
});

// Mock the canvas module
vi.mock("canvas", () => {
  const mockContext = {
    fillStyle: "",
    font: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
  };

  const mockCanvas = {
    getContext: vi.fn().mockReturnValue(mockContext),
    toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
    width: 300,
    height: 200,
  };

  return {
    createCanvas: vi.fn().mockReturnValue(mockCanvas),
    loadImage: vi.fn().mockResolvedValue({
      width: 100,
      height: 100,
    }),
  };
});

// Mock the child_process module
vi.mock("child_process", () => {
  return {
    exec: vi.fn().mockImplementation((command, callback) => {
      if (callback) {
        callback(null, { stdout: "test", stderr: "" });
      }
      return {
        stdout: {
          on: vi.fn(),
        },
        stderr: {
          on: vi.fn(),
        },
        on: vi.fn(),
      };
    }),
    spawn: vi.fn().mockReturnValue({
      stdout: {
        on: vi.fn(),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn(),
    }),
  };
});

// Mock the QRCode module
vi.mock("qrcode", () => {
  return {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock the JsBarcode module correctly
vi.mock("jsbarcode", () => {
  // Create a mock function
  const jsBarcodeFunction = vi.fn();

  // Return an object with the default export
  const mockExports = {
    default: jsBarcodeFunction,
  };

  // Support both ways of importing
  jsBarcodeFunction.default = jsBarcodeFunction;

  return mockExports;
});

// Mock the csv-writer module
vi.mock("csv-writer", () => {
  return {
    createObjectCsvWriter: vi.fn().mockReturnValue({
      writeRecords: vi.fn().mockResolvedValue(undefined),
    }),
  };
});
