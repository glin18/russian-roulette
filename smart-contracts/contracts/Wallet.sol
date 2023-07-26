// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract Wallet {
    address payable public owner;
    mapping(address => uint256) public amount;

     modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    receive() external payable {}

    function withdraw(uint _amount) external onlyOwner {
        payable(msg.sender).transfer(_amount);
    }

    function getBalance() external view onlyOwner returns (uint)  {
        return address(this).balance;
    }

    function depositA() public payable{
        require(msg.value==1e14, "Didn't send enough!"); // 0.001ETH
        amount[msg.sender] = 1e14;
    }

    // function cashOut(uint256 playersDead, address player) external onlyOwner { 
    //     require(amount[player] == 1e14);
    //     amount[player] = 0;
    //     if(playersDead == 1){
    //         payable(player).transfer(1e14*1.33);
    //     } else if(playersDead == 2){
    //         payable(player).transfer(1e14*2);
    //     } else if(playersDead == 3){
    //         payable(player).transfer(1e14*4);
    //     } else if(playersDead == 0){
    //         payable(player).transfer(1e14);
    //     }
    // }   

    function cashOut(uint256 playersDead, address[] calldata players) external onlyOwner { 
    
    for(uint i = 0; i < players.length; i++) {
        address player = players[i];
        require(amount[player] == 1e14, "Invalid amount for player");
        amount[player] = 0;

        uint256 transferAmount;
        if(playersDead == 1){
            transferAmount = 1e14*1.33;
        } else if(playersDead == 2){
            transferAmount = 1e14*2;
        } else if(playersDead == 3){
            transferAmount = 1e14*4;
        } else if(playersDead == 0){
            transferAmount = 1e14;
        } else {
            revert("Unexpected number of dead players");
        }

        payable(player).transfer(transferAmount);
    }
}  

    function playerReset(address player) external onlyOwner {
        amount[player] = 0;
    } 
}