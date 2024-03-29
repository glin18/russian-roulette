// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Roulette is VRFConsumerBaseV2 {
    uint64 s_subscriptionId;
    address vrfCoordinator = 0x6D80646bEAdd07cE68cab36c27c626790bBcf17f;
    bytes32 s_keyHash = 0x83d1b6e3388bed3d76426974512bb0d270e9542a765cd667242ea26c0cc0b730;
    uint32 callbackGasLimit = 160000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 4;
    address s_owner;
    VRFCoordinatorV2Interface COORDINATOR;

    struct Room {
        uint256[] firedResults;
        bool gameActive;
    }

    mapping(uint256 => Room) public rooms;
    mapping(uint256 => uint256) public requestIdToRoomId;

    uint256[] public firedResults;

    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }

    event Fired(uint256 indexed requestId, uint256 indexed roomId);
    event BulletLanded(
        uint256 indexed requestId,
        uint256[] indexed firedResults
    );

    // Obtain requestID
    function fire(uint256 roomId) public onlyOwner returns (uint256 requestId) {
        require(!rooms[roomId].gameActive, "Game in room already active");
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        requestIdToRoomId[requestId] = roomId;
        rooms[roomId].gameActive = true;
        emit Fired(requestId, roomId);
    }

    // Obtain actual results
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 roomId = requestIdToRoomId[requestId];
        require(rooms[roomId].gameActive, "No active game for this request");

        // array of results
        rooms[roomId].firedResults = [
            randomWords[0] % 2,
            randomWords[1] % 2,
            randomWords[2] % 2,
            randomWords[3] % 2
        ];
        rooms[roomId].gameActive = false;

        // emitting event to signal that results have been created
        emit BulletLanded(requestId, rooms[roomId].firedResults);
    }

    function getRoomFiredResults(
        uint256 roomId
    ) public view returns (uint256[] memory) {
        return rooms[roomId].firedResults;
    }
}
