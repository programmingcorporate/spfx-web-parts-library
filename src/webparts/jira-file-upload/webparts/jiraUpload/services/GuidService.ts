export class GuidService {
  public static newGuid(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version 4 bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set RFC 4122 variant bits
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes)
      .map(b => ('00' + b.toString(16)).slice(-2))
      .join('');

    return (
      hex.substring(0, 8) + '-' +
      hex.substring(8, 12) + '-' +
      hex.substring(12, 16) + '-' +
      hex.substring(16, 20) + '-' +
      hex.substring(20, 32)
    );
  }
}