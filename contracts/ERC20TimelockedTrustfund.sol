// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20TimeLockedTrustfund is Ownable {

    address public admin;
    address public reserve;
    address public beneficiary;

    uint public ContractBalance;
    uint public EndTime;
    
    bool public isAdmin;
    bool public isReserve;
    bool public isOwner;
  
    IERC20[] tokens;
    /// Mappings
    
    
    /// Events
    event ERC20Deposit(uint amount, address sender, string tokenName);
    event depositDone(uint amount, address indexed depositedTo);
    event InitiatedTrustFund(
        address beneficiary,
        address admin,
        address reserve,
        uint Duration,
        uint EndTime
    );
    event Withdrawn(address beneficiary, uint time);
    
    /// Errors
    error LowFunds(string description);
    error OnlyAdmins(bool isAdmin, bool isOwner, bool isReserve);
    error OnlyOwners(string description);
    

    ///@param _beneficiary  is the reciever of the funds.
    ///@param _admin        one of the signers for withdraw.
    ///@param _reserve      one of the signers for withdraw. Only used as reserve signer. 
    constructor(address _beneficiary, address _admin, address _reserve) {
        beneficiary = payable(_beneficiary);
        admin = _admin;
        reserve = _reserve;

        ///@dev duration is 10 years calculated into seconds.
        uint Duration = 31556926 * 10;
        EndTime = block.timestamp + Duration;
        
        emit InitiatedTrustFund(beneficiary, admin, reserve, Duration, EndTime);
    }

    
    /// Should deposit ERC20 tokens into the contract
    ///@param _token  The address of the ERC20 token deposited
    ///@param _amount The amount of ether in WEI, to deposit
    function ERC20deposit(address _token, uint _amount) public payable {
        ERC20 token = ERC20(_token);
        token.transferFrom(msg.sender, address(this), _amount);
        
        string memory tokenName = token.name();
        tokens.push(IERC20(token));

        emit ERC20Deposit(_amount, msg.sender, tokenName);
    }


    /// Should deposit ETH into the contract
    function ETHdeposit() public payable returns (uint) {
        ContractBalance += msg.value;

        emit depositDone(msg.value, msg.sender);

        return ContractBalance;
    }
    
    function getBalance() public view returns (uint){
        return ContractBalance;
    }
    function getERC20Balance(IERC20 _token) public view returns (uint){
        return _token.balanceOf(address(this));
    }


    function approveWithdraw() external returns (bool approved) {
        require(admin == msg.sender || Ownable.owner() == msg.sender || reserve == msg.sender, "TrustFund: Only an admin can call this function!");
        
        if(msg.sender == admin) {
            isAdmin = true;
        }
        if(msg.sender == Ownable.owner()) {
            isOwner = true;
        }
        if(msg.sender == reserve) {
            isReserve = true;
        }
        
        if(isAdmin && isOwner || isAdmin && isReserve || isOwner && isReserve) {
            _ERC20withdraw();
            return true;
        }   
        if(beneficiary == msg.sender) {
            _ERC20withdraw();
            return true;
        }
        return false;
    }
    

    // Returns the deposited tokens address.
    function getTokens() public view returns ( IERC20[] memory ) {
        return tokens;
    }
    
    function _ERC20withdraw() internal {
        require(EndTime <= block.timestamp, 
            "TrustFund: TrustFund is not open for withdraws yet! Please check the ENDTIME."
        );
        
        uint time = block.timestamp;
        for (uint i = 0; i < tokens.length; i++) {
            uint tokenBalance = tokens[i].balanceOf(address(this));
           
            if (tokenBalance > 0) {
                tokens[i].transfer(beneficiary, tokenBalance);
            }
        } 

        emit Withdrawn(beneficiary, time);
    }

    function ETHwithdraw() public returns (uint amount){
        require(admin == msg.sender || Ownable.owner() == msg.sender || reserve == msg.sender, "TrustFund: Only an admin can call this function!");
        require(ContractBalance >= 0);
        
        uint _amount = ContractBalance;
        
        ContractBalance -= _amount;
        
        payable(beneficiary).transfer(_amount);
        
        return ContractBalance;
    }




    // Transfers the funds to the Owner account and removes the smart-contract from the blockchain
    function destroyContract() public payable onlyOwner() {
        address _owner = Ownable.owner();
        if (_owner != msg.sender) revert OnlyOwners("TrustFund: Only the OWNER can execute selfdestruct!");

        address payable addr = payable(address(_owner));
        
        selfdestruct(addr);
    }


}

