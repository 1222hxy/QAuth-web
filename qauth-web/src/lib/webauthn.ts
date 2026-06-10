export interface WebAuthnEnvironment {
  isSecureContext: boolean;
  isTopLevelContext: boolean;
  hasPublicKeyCredential: boolean;
  hasCredentialsApi: boolean;
  platformAuthenticator: boolean | null;
  rpId: string;
  origin: string;
}

export interface ClientDataCheck {
  type: boolean;
  challenge: boolean;
  origin: boolean;
  passed: boolean;
}

export interface DemoPasskeyCreationResult {
  credential: PublicKeyCredential;
  challenge: Uint8Array;
  challengeBase64URL: string;
  id: string;
  rawId: string;
  clientDataJSON: Record<string, unknown>;
  attestationObject: string;
  authenticatorAttachment: string | null;
  transports: string[];
  check: ClientDataCheck;
}

export interface DemoPasskeyAssertionResult {
  credential: PublicKeyCredential;
  challenge: Uint8Array;
  challengeBase64URL: string;
  id: string;
  authenticatorData: string;
  clientDataJSON: Record<string, unknown>;
  signature: string;
  userHandle: string | null;
  check: ClientDataCheck;
  userVerified: boolean | null;
}

export function randomChallenge(length = 32): Uint8Array<ArrayBuffer> {
  return randomBytes(length);
}

export function randomUserId(length = 16): Uint8Array<ArrayBuffer> {
  return randomBytes(length);
}

export function bufferToBase64URL(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function base64URLToBuffer(value: string): ArrayBuffer {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

export function decodeClientDataJSON(buffer: ArrayBuffer): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(buffer)) as Record<string, unknown>;
}

export function getCurrentRpId(): string {
  return typeof window === "undefined" ? "" : window.location.hostname;
}

export function getCurrentOrigin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export function isWebAuthnSupported(): boolean {
  return typeof window !== "undefined" && "PublicKeyCredential" in window && !!navigator.credentials;
}

export async function getWebAuthnEnvironment(): Promise<WebAuthnEnvironment> {
  let platformAuthenticator: boolean | null = null;
  const hasPublicKeyCredential = typeof window !== "undefined" && "PublicKeyCredential" in window;
  if (hasPublicKeyCredential && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
    try {
      platformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      platformAuthenticator = null;
    }
  }

  return {
    isSecureContext: typeof window !== "undefined" ? window.isSecureContext : false,
    isTopLevelContext: typeof window !== "undefined" ? window.top === window.self : false,
    hasPublicKeyCredential,
    hasCredentialsApi: typeof navigator !== "undefined" && !!navigator.credentials,
    platformAuthenticator,
    rpId: getCurrentRpId(),
    origin: getCurrentOrigin(),
  };
}

export async function createDemoPasskey(): Promise<DemoPasskeyCreationResult> {
  assertWebAuthnReady("create");
  const challenge = randomChallenge(32);
  const challengeBase64URL = bufferToBase64URL(challenge);
  const rpId = getCurrentRpId();
  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { id: rpId, name: "QAuth Demo" },
    user: {
      id: randomUserId(16),
      name: `demo-user@${rpId}`,
      displayName: "QAuth Demo User",
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "preferred",
      requireResidentKey: false,
      userVerification: "preferred",
    },
    timeout: 60_000,
    attestation: "none",
  };

  const credential = await navigator.credentials.create({ publicKey });
  if (!credential || credential.type !== "public-key") throw new Error("No public key credential was created.");
  const publicCredential = credential as PublicKeyCredential;
  const response = publicCredential.response as AuthenticatorAttestationResponse;
  const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
  const check = verifyClientData(clientDataJSON, "webauthn.create", challengeBase64URL);
  const transports = typeof response.getTransports === "function" ? response.getTransports() : [];

  return {
    credential: publicCredential,
    challenge,
    challengeBase64URL,
    id: publicCredential.id,
    rawId: bufferToBase64URL(publicCredential.rawId),
    clientDataJSON,
    attestationObject: bufferToBase64URL(response.attestationObject),
    authenticatorAttachment: publicCredential.authenticatorAttachment ?? null,
    transports,
    check,
  };
}

export async function getDemoPasskeyAssertion(savedCredentialId: string): Promise<DemoPasskeyAssertionResult> {
  assertWebAuthnReady("get");
  const challenge = randomChallenge(32);
  const challengeBase64URL = bufferToBase64URL(challenge);
  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: getCurrentRpId(),
    allowCredentials: [
      {
        id: base64URLToBuffer(savedCredentialId),
        type: "public-key",
        transports: ["internal"],
      },
    ],
    userVerification: "preferred",
    timeout: 60_000,
  };

  const credential = await navigator.credentials.get({ publicKey });
  if (!credential || credential.type !== "public-key") throw new Error("No public key credential was returned.");
  const publicCredential = credential as PublicKeyCredential;
  const response = publicCredential.response as AuthenticatorAssertionResponse;
  const clientDataJSON = decodeClientDataJSON(response.clientDataJSON);
  const check = verifyClientData(clientDataJSON, "webauthn.get", challengeBase64URL);

  return {
    credential: publicCredential,
    challenge,
    challengeBase64URL,
    id: publicCredential.id,
    authenticatorData: bufferToBase64URL(response.authenticatorData),
    clientDataJSON,
    signature: bufferToBase64URL(response.signature),
    userHandle: response.userHandle ? bufferToBase64URL(response.userHandle) : null,
    check,
    userVerified: readUserVerified(response.authenticatorData),
  };
}

function verifyClientData(clientData: Record<string, unknown>, expectedType: string, challenge: string): ClientDataCheck {
  const type = clientData.type === expectedType;
  const origin = clientData.origin === getCurrentOrigin();
  const challengeMatches = clientData.challenge === challenge;
  return { type, origin, challenge: challengeMatches, passed: type && origin && challengeMatches };
}

function readUserVerified(authenticatorData: ArrayBuffer): boolean | null {
  const flags = new Uint8Array(authenticatorData)[32];
  return typeof flags === "number" ? Boolean(flags & 0x04) : null;
}

function assertWebAuthnReady(action: "create" | "get") {
  if (!window.isSecureContext) throw new DOMException("WebAuthn requires a secure context.", "SecurityError");
  if (!window.PublicKeyCredential || !navigator.credentials?.[action]) throw new DOMException("WebAuthn is not supported.", "NotSupportedError");
  if (window.top !== window.self) throw new DOMException("WebAuthn must run in a top-level context.", "SecurityError");
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(length));
  crypto.getRandomValues(bytes);
  return bytes;
}
