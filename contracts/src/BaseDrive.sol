// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseDrive {
    mapping(address => uint256) public bestScore;

    event ScoreSubmitted(
        address player,
        uint256 score
    );

    function submitScore(uint256 score) external {
        require(
            score > bestScore[msg.sender],
            "Not higher"
        );

        bestScore[msg.sender] = score;

        emit ScoreSubmitted(
            msg.sender,
            score
        );
    }
}
