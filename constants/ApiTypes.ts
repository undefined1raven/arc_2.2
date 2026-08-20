type CreateChallengeResponse = {
  challenge: string;
};

type VerifyChallengeResponse = {
  token: string;
};

export { CreateChallengeResponse, VerifyChallengeResponse };
