export const CONTRACT_ADDRESS = '0x9F44aB62d3d14fc44f679A9bDAf9FCf1EF35bDAA' as const;

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "submitScore",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "score",
        "type": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "type": "event",
    "name": "ScoreSubmitted",
    "inputs": [
      {
        "name": "player",
        "type": "address",
        "indexed": false
      },
      {
        "name": "score",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  }
] as const;
