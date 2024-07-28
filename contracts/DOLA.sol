// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract DOLAToken is ERC20 {
    AggregatorV3Interface internal roiPriceFeed;
    AggregatorV3Interface internal bdolaPriceFeed;
    IERC20 public bdolaToken;

    constructor(
        string memory name,
        string memory symbol,
        address _roiPriceFeed,
        address _bdolaPriceFeed,
        address _bdolaToken
    ) ERC20(name, symbol) {
        roiPriceFeed = AggregatorV3Interface(_roiPriceFeed);
        bdolaPriceFeed = AggregatorV3Interface(_bdolaPriceFeed);
        bdolaToken = IERC20(_bdolaToken);
    }

    function getLatestPrice(AggregatorV3Interface priceFeed) public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function mint(uint256 amount) public payable {
        // Get the latest price of ROI
        int roiPrice = getLatestPrice(roiPriceFeed);
        require(roiPrice > 0, "Invalid ROI price");

        // Get the latest price of BDOLA
        int bdolaPrice = getLatestPrice(bdolaPriceFeed);
        require(bdolaPrice > 0, "Invalid BDOLA price");

        // Calculate the amount of BDOLA required as collateral
        uint256 collateralAmount = (amount * uint256(roiPrice)) / uint256(bdolaPrice);
        require(collateralAmount > 0, "Invalid collateral amount");

        // Check the sender's BDOLA balance and allowance
        uint256 senderBalance = bdolaToken.balanceOf(msg.sender);
        uint256 senderAllowance = bdolaToken.allowance(msg.sender, address(this));
        require(senderBalance >= collateralAmount, "Insufficient BDOLA balance");
        require(senderAllowance >= collateralAmount, "Insufficient BDOLA allowance");

        // Transfer BDOLA from the sender to the contract as collateral
        require(bdolaToken.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");

        // Mint the DOLA tokens
        _mint(msg.sender, amount);
    }

    function burn(uint256 amount) public {
        // Get the latest price of ROI
        int roiPrice = getLatestPrice(roiPriceFeed);
        require(roiPrice > 0, "Invalid ROI price");

        // Get the latest price of BDOLA
        int bdolaPrice = getLatestPrice(bdolaPriceFeed);
        require(bdolaPrice > 0, "Invalid BDOLA price");

        // Calculate the amount of BDOLA to return
        uint256 returnAmount = (amount * uint256(roiPrice)) / uint256(bdolaPrice);
        require(returnAmount > 0, "Invalid return amount");

        // Burn the DOLA tokens
        _burn(msg.sender, amount);

        // Transfer the BDOLA tokens back to the sender
        require(bdolaToken.transfer(msg.sender, returnAmount), "Collateral return failed");
    }
}
