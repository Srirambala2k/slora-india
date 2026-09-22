/**
 * The chat window is a VISUAL SHELL for now (plan Phase 1, step 1J): the questions and the
 * checks are real, but nothing is sent anywhere yet (no Telegram, email or AI is connected —
 * that is Phase 3). While this is true the window says so plainly and never claims that an
 * enquiry was received. Flip to `false` when the enquiry is really submitted to /api/leads.
 */
export const CHAT_PREVIEW_MODE = true;
