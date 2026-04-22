declare global {
  namespace Express {
    interface Request {
      offerOwnership?: { isProvider: boolean; isClient: boolean };
      requestId?: string;
    }
  }
}

export {};
