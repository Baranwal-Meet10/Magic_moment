// ---------------------------------------------------------------------------
// slug.ts — Unique gift-link identifier generator
// ---------------------------------------------------------------------------
// Used by /create to build the public `/g/:slug` URL.
// - 12 chars from a 56-char unambiguous alphabet ≈ 68 bits of entropy,
//   effectively unguessable so link secrecy = gift secrecy.
// - Excludes look-alikes (0/O, 1/l/I) so slugs stay readable if typed.
// ---------------------------------------------------------------------------
import { customAlphabet } from "nanoid";

const alphabet = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const nano = customAlphabet(alphabet, 12);

/** Generate a new random slug for a gift link. */
export const generateSlug = () => nano();
