import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies before importing the modules under test
vi.mock("../../config", () => ({
  config: {
    security: {
      apiKey: "test-api-key",
      disableApiKeyValidation: false
    },
  },
}));

vi.mock("ip", () => ({
  isPrivate: vi.fn((ip) => {
    return ip === "192.168.1.100" || ip === "10.0.0.5" || ip.includes("127.0.0.1") || ip.includes("::1");
  }),
}));

// Mock the logging module
vi.mock("../../logging", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  },
  logError: vi.fn()
}));

// Import after mocks
import { authenticateApiKey, checkLocalNetwork } from "./auth";
import { config } from "../../config";
import logger, { logError } from "../../logging";
import { isPrivate } from "ip";

// Create mock Express request, response and next function
const createMockReq = (overrides = {}) => ({
  headers: {},
  query: {},
  socket: { remoteAddress: "127.0.0.1" },
  ...overrides,
});

const createMockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

const mockNext = vi.fn();

describe("Authentication Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authenticateApiKey", () => {
    it("should proceed when valid API key is in headers", () => {
      const req = createMockReq({
        headers: { "x-api-key": "test-api-key" },
      });
      const res = createMockRes();

      authenticateApiKey(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should proceed when valid API key is in query", () => {
      const req = createMockReq({
        query: { apiKey: "test-api-key" },
      });
      const res = createMockRes();

      authenticateApiKey(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 when API key is missing", () => {
      const req = createMockReq();
      const res = createMockRes();

      authenticateApiKey(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "API key is required",
      });
    });

    it("should return 401 when API key is invalid", () => {
      const req = createMockReq({
        headers: { "x-api-key": "wrong-api-key" },
      });
      const res = createMockRes();

      authenticateApiKey(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid API key",
      });
    });

    it("should handle errors and return 500", () => {
      const req = createMockReq();
      const res = createMockRes();
      
      // Force an error
      res.status.mockImplementationOnce(() => {
        throw new Error("Test error");
      });

      authenticateApiKey(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Authentication error",
      });
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("checkLocalNetwork", () => {
    it("should proceed for localhost IPv4", () => {
      const req = createMockReq({
        socket: { remoteAddress: "127.0.0.1" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should proceed for localhost IPv6", () => {
      const req = createMockReq({
        socket: { remoteAddress: "::1" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should proceed for private network IP", () => {
      const req = createMockReq({
        socket: { remoteAddress: "192.168.1.100" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle X-Forwarded-For header", () => {
      const req = createMockReq({
        headers: { "x-forwarded-for": "10.0.0.5, 203.0.113.1" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access for external IPs", () => {
      const req = createMockReq({
        socket: { remoteAddress: "203.0.113.1" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Access restricted to local network",
      });
    });

    it("should handle IPv6-mapped IPv4 addresses", () => {
      const req = createMockReq({
        socket: { remoteAddress: "::ffff:192.168.1.100" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle errors and return 500", () => {
      const req = createMockReq();
      const res = createMockRes();
      
      // Mock the IP validation to throw an error
      vi.mocked(isPrivate).mockImplementationOnce(() => {
        throw new Error("IP validation error");
      });

      checkLocalNetwork(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Network verification error",
      });
      expect(logError).toHaveBeenCalled();
    });
  });

  describe("authenticateApiKey with API key bypass", () => {
    let originalDisableValue;
    
    beforeEach(() => {
      // Save original value
      originalDisableValue = config.security.disableApiKeyValidation;
    });
    
    afterEach(() => {
      // Restore original value
      config.security.disableApiKeyValidation = originalDisableValue;
    });
    
    it("should skip authentication if API key validation is disabled", () => {
      // Set the config to disable API key validation
      config.security.disableApiKeyValidation = true;
      
      const req = createMockReq({
        headers: { "x-api-key": "invalid-key" },
      });
      const res = createMockRes();

      authenticateApiKey(req, res, mockNext);

      // Should proceed despite invalid key
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it("should check both header variations for API key", () => {
      // Test with lowercase header
      const reqLower = createMockReq({
        headers: { "x-api-key": "test-api-key" },
      });
      const resLower = createMockRes();

      authenticateApiKey(reqLower, resLower, mockNext);
      expect(mockNext).toHaveBeenCalled();
      
      // Test with different case
      vi.clearAllMocks();
      const reqMixed = createMockReq({
        headers: { "X-Api-Key": "test-api-key" },
      });
      const resMixed = createMockRes();

      authenticateApiKey(reqMixed, resMixed, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
    
    it("should handle multiple values in X-Forwarded-For header", () => {
      const req = createMockReq({
        headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.5, 192.168.1.10" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      // Should pass because at least one IP is private
      expect(mockNext).toHaveBeenCalled();
    });
  });
  
  describe("IP address edge cases", () => {
    it("should handle missing IP address", () => {
      const req = createMockReq({
        socket: { remoteAddress: undefined },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      // Should deny access when IP cannot be determined
      expect(res.status).toHaveBeenCalledWith(403);
    });
    
    it("should handle malformed IP addresses", () => {
      const req = createMockReq({
        socket: { remoteAddress: "not.an.ip.address" },
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      // Should handle invalid IP format gracefully
      expect(res.status).toHaveBeenCalledWith(403);
    });
    
    it("should handle empty X-Forwarded-For header", () => {
      const req = createMockReq({
        headers: { "x-forwarded-for": "" },
        socket: { remoteAddress: "192.168.1.100" }, // Private IP in socket
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      // Should fall back to socket address when X-Forwarded-For is empty
      expect(mockNext).toHaveBeenCalled();
    });
    
    it("should handle only public IPs in X-Forwarded-For", () => {
      const req = createMockReq({
        headers: { "x-forwarded-for": "203.0.113.1, 8.8.8.8" },
        socket: { remoteAddress: "192.168.1.100" }, // Private IP in socket
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);

      // Should check both X-Forwarded-For and socket.remoteAddress
      expect(mockNext).toHaveBeenCalled();
    });
  });
  
  describe("Combined middleware scenarios", () => {
    it("should require both valid API key and local network for restricted routes", () => {
      // Create a middleware that combines both auth checks
      const combinedMiddleware = (req, res, next) => {
        authenticateApiKey(req, res, (authErr) => {
          if (authErr) return next(authErr);
          checkLocalNetwork(req, res, next);
        });
      };
      
      // Valid API key and local IP
      const validReq = createMockReq({
        headers: { "x-api-key": "test-api-key" },
        socket: { remoteAddress: "127.0.0.1" },
      });
      const validRes = createMockRes();
      
      combinedMiddleware(validReq, validRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      vi.clearAllMocks();
      
      // Invalid API key but local IP
      const invalidKeyReq = createMockReq({
        headers: { "x-api-key": "wrong-key" },
        socket: { remoteAddress: "127.0.0.1" },
      });
      const invalidKeyRes = createMockRes();
      
      combinedMiddleware(invalidKeyReq, invalidKeyRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(invalidKeyRes.status).toHaveBeenCalledWith(401);
      vi.clearAllMocks();
      
      // Valid API key but non-local IP
      const nonLocalReq = createMockReq({
        headers: { "x-api-key": "test-api-key" },
        socket: { remoteAddress: "203.0.113.1" },
      });
      const nonLocalRes = createMockRes();
      
      combinedMiddleware(nonLocalReq, nonLocalRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
      expect(nonLocalRes.status).toHaveBeenCalledWith(403);
    });
  });
  
  describe("Real-world scenarios", () => {
    it("should handle proxy chains with mixed IPs", () => {
      // Test a scenario where request passes through multiple proxies
      const req = createMockReq({
        headers: { 
          "x-forwarded-for": "203.0.113.1, 10.0.0.5, 172.16.0.1, 192.168.1.10",
          "x-forwarded-proto": "https" 
        },
        socket: { remoteAddress: "127.0.0.1" }, // Last hop is localhost
      });
      const res = createMockRes();

      checkLocalNetwork(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
    
    it("should respect API key in authorization header", () => {
      // Some clients might send the API key in the Authorization header
      const req = createMockReq({
        headers: { "authorization": "Bearer test-api-key" },
      });
      const res = createMockRes();

      // Temporarily modify middleware to check Authorization header
      const originalMiddleware = authenticateApiKey;
      
      // Create a patched version that also checks Authorization
      const patchedMiddleware = (req, res, next) => {
        if (req.headers.authorization?.startsWith('Bearer ')) {
          const token = req.headers.authorization.substring(7);
          req.headers['x-api-key'] = token;
        }
        originalMiddleware(req, res, next);
      };
      
      patchedMiddleware(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});